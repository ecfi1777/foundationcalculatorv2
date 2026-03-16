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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin check
    const { data: userRow } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!userRow?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DB-side aggregates — no row loading into memory
    const [
      affiliatesRes,
      referralsRes,
      conversionsRes,
      pendingRes,
      paidRes,
    ] = await Promise.all([
      supabase.from("affiliates").select("id", { count: "exact", head: true }),
      supabase.from("referrals").select("id", { count: "exact", head: true }),
      supabase.from("referrals").select("id", { count: "exact", head: true }).eq("status", "converted"),
      supabase.from("affiliate_commissions").select("amount_cents").eq("status", "pending"),
      supabase.from("affiliate_commissions").select("amount_cents").eq("status", "paid"),
    ]);

    const totalPendingCents = (pendingRes.data || []).reduce(
      (sum, c) => sum + (c.amount_cents || 0), 0
    );
    const totalPaidCents = (paidRes.data || []).reduce(
      (sum, c) => sum + (c.amount_cents || 0), 0
    );

    return new Response(
      JSON.stringify({
        total_affiliates: affiliatesRes.count ?? 0,
        total_referrals: referralsRes.count ?? 0,
        total_conversions: conversionsRes.count ?? 0,
        total_pending_cents: totalPendingCents,
        total_paid_cents: totalPaidCents,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
