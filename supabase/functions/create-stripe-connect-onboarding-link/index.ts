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

    // Load affiliate
    const { data: affiliate, error: affErr } = await supabase
      .from("affiliates")
      .select("id, stripe_connect_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (affErr) throw affErr;
    if (!affiliate) {
      return new Response(JSON.stringify({ error: "Not an affiliate" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    let stripeConnectId = affiliate.stripe_connect_id;

    // Create Stripe Express account if needed
    if (!stripeConnectId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
      });
      stripeConnectId = account.id;

      // Save to affiliates table
      const { error: updateErr } = await supabase
        .from("affiliates")
        .update({ stripe_connect_id: stripeConnectId })
        .eq("id", affiliate.id);

      if (updateErr) throw updateErr;
    }

    // Build URLs
    const appUrl =
      Deno.env.get("VITE_APP_URL") ||
      req.headers.get("origin") ||
      "https://foundationcalculatorv2.lovable.app";

    let refreshUrl = `${appUrl}/affiliate`;
    let returnUrl = `${appUrl}/affiliate`;

    // Optional returnUrl override from body
    try {
      const body = await req.json();
      if (body?.returnUrl && typeof body.returnUrl === "string") {
        if (body.returnUrl.startsWith(appUrl)) {
          refreshUrl = body.returnUrl;
          returnUrl = body.returnUrl;
        }
      }
    } catch {
      // No body or invalid JSON — use defaults
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      type: "account_onboarding",
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
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
