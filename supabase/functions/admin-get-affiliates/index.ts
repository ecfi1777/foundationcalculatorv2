import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

    // 1. Fetch all affiliates with user email
    const { data: affiliates, error: affErr } = await supabase
      .from("affiliates")
      .select("id, user_id, referral_code, status, total_referred, total_earned_cents, stripe_connect_id, commission_pct, created_at, users!inner(email)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (affErr) throw affErr;

    const affiliateIds = (affiliates || []).map((a: any) => a.id);

    if (affiliateIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch referrals for conversion counts
    const { data: referrals } = await supabase
      .from("referrals")
      .select("affiliate_id, status")
      .in("affiliate_id", affiliateIds);

    const conversionMap: Record<string, number> = {};
    for (const r of referrals || []) {
      if (r.status === "converted") {
        conversionMap[r.affiliate_id] = (conversionMap[r.affiliate_id] || 0) + 1;
      }
    }

    // 3. Fetch commissions for latest payout status
    const { data: commissions } = await supabase
      .from("affiliate_commissions")
      .select("affiliate_id, status, created_at")
      .in("affiliate_id", affiliateIds)
      .order("created_at", { ascending: false });

    const payoutStatusMap: Record<string, string> = {};
    for (const c of commissions || []) {
      if (!payoutStatusMap[c.affiliate_id]) {
        payoutStatusMap[c.affiliate_id] = c.status;
      }
    }

    // Build result
    const result = (affiliates || []).map((a: any) => ({
      id: a.id,
      referral_code: a.referral_code,
      email: a.users?.email || "",
      status: a.status,
      total_referred: a.total_referred,
      conversions: conversionMap[a.id] || 0,
      total_earned_cents: a.total_earned_cents,
      commission_pct: a.commission_pct,
      stripe_connect_status: a.stripe_connect_id ? "Connected" : "Not Connected",
      payout_status: payoutStatusMap[a.id] || "none",
      created_at: a.created_at,
    }));

    return new Response(JSON.stringify(result), {
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
