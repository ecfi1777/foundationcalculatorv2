import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Cache duration: 6 hours in milliseconds
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
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

    // Load affiliate (include cache columns)
    const { data: affiliate, error: affErr } = await supabase
      .from("affiliates")
      .select("id, stripe_connect_id, stripe_payouts_enabled, stripe_details_submitted, stripe_status_checked_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (affErr) throw affErr;
    if (!affiliate) {
      return new Response(JSON.stringify({ error: "Not an affiliate" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!affiliate.stripe_connect_id) {
      return new Response(
        JSON.stringify({
          connected: false,
          payouts_enabled: false,
          details_submitted: false,
          stripe_connect_id: null,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Check cache: return cached values if fresh (< 6 hours old) ──
    if (affiliate.stripe_status_checked_at) {
      const checkedAt = new Date(affiliate.stripe_status_checked_at).getTime();
      const age = Date.now() - checkedAt;
      if (age < CACHE_TTL_MS) {
        return new Response(
          JSON.stringify({
            connected: true,
            payouts_enabled: affiliate.stripe_payouts_enabled,
            details_submitted: affiliate.stripe_details_submitted,
            stripe_connect_id: affiliate.stripe_connect_id,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // ── Cache stale or missing: call Stripe API ──
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const account = await stripe.accounts.retrieve(affiliate.stripe_connect_id);

    const payoutsEnabled = account.payouts_enabled ?? false;
    const detailsSubmitted = account.details_submitted ?? false;

    // Update cache columns
    await supabase
      .from("affiliates")
      .update({
        stripe_payouts_enabled: payoutsEnabled,
        stripe_details_submitted: detailsSubmitted,
        stripe_status_checked_at: new Date().toISOString(),
      })
      .eq("id", affiliate.id);

    return new Response(
      JSON.stringify({
        connected: true,
        payouts_enabled: payoutsEnabled,
        details_submitted: detailsSubmitted,
        stripe_connect_id: affiliate.stripe_connect_id,
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
