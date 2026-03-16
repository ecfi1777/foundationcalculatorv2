import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin check
    const { data: adminRow } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminRow?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Batch snapshot: select only id, affiliate_id, amount_cents
    const { data: pendingRows, error: pendErr } = await supabase
      .from("affiliate_commissions")
      .select("id, affiliate_id, amount_cents")
      .eq("status", "pending")
      .is("stripe_transfer_id", null);

    if (pendErr) throw pendErr;

    if (!pendingRows || pendingRows.length === 0) {
      return new Response(JSON.stringify({
        paid_affiliates: 0,
        skipped_affiliates: 0,
        failed_affiliates: 0,
        total_amount_cents: 0,
        message: "No pending commissions found",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by affiliate_id
    const grouped: Record<string, { id: string; amount_cents: number }[]> = {};
    for (const row of pendingRows) {
      if (!grouped[row.affiliate_id]) {
        grouped[row.affiliate_id] = [];
      }
      grouped[row.affiliate_id].push({ id: row.id, amount_cents: row.amount_cents });
    }

    const affiliateIds = Object.keys(grouped);

    // Fetch affiliate records for stripe_connect_id
    const { data: affiliates } = await supabase
      .from("affiliates")
      .select("id, stripe_connect_id")
      .in("id", affiliateIds);

    const affiliateMap: Record<string, string | null> = {};
    for (const a of affiliates || []) {
      affiliateMap[a.id] = a.stripe_connect_id;
    }

    let paid_affiliates = 0;
    let skipped_affiliates = 0;
    let failed_affiliates = 0;
    let total_amount_cents = 0;

    for (const affiliateId of affiliateIds) {
      const rows = grouped[affiliateId];
      const rowIds = rows.map((r) => r.id);
      const totalCents = rows.reduce((sum, r) => sum + r.amount_cents, 0);
      const stripeConnectId = affiliateMap[affiliateId];

      if (!stripeConnectId) {
        skipped_affiliates++;
        console.log(`Skipping affiliate ${affiliateId}: no stripe_connect_id`);
        continue;
      }

      try {
        // Create Stripe transfer
        const transfer = await stripe.transfers.create({
          destination: stripeConnectId,
          amount: totalCents,
          currency: "usd",
        });

        // Update exact commission row IDs
        const { data: updatedRows } = await supabase
          .from("affiliate_commissions")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_transfer_id: transfer.id,
          })
          .in("id", rowIds)
          .select("id");

        const updatedCount = updatedRows?.length || 0;

        // Row count verification
        if (updatedCount < rowIds.length) {
          console.warn(
            `Affiliate ${affiliateId}: expected ${rowIds.length} rows updated, got ${updatedCount}. ` +
            `Stripe transfer ${transfer.id} succeeded but DB state is inconsistent. Marking as failed for manual review.`
          );
          failed_affiliates++;
          continue;
        }

        // Only increment earnings if all rows updated successfully
        await supabase.rpc("increment_affiliate_earnings", {
          affiliate_row_id: affiliateId,
          amount: totalCents,
        });

        paid_affiliates++;
        total_amount_cents += totalCents;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`Payout failed for affiliate ${affiliateId}: ${errMsg}`);
        failed_affiliates++;
      }
    }

    return new Response(JSON.stringify({
      paid_affiliates,
      skipped_affiliates,
      failed_affiliates,
      total_amount_cents,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
