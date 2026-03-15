import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REMOVE-SEAT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Function started");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

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

    const userId = user.id;
    log("User authenticated", { userId });

    const { orgId, memberId } = await req.json();
    if (!orgId || !memberId) {
      return new Response(JSON.stringify({ error: "orgId and memberId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify caller is org OWNER
    const { data: ownership } = await supabase
      .from("org_members")
      .select("id")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .eq("role", "owner")
      .eq("status", "active")
      .maybeSingle();

    if (!ownership) {
      return new Response(JSON.stringify({ error: "Only the org owner can remove members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch member to get user_id
    const { data: member } = await supabase
      .from("org_members")
      .select("id, user_id")
      .eq("id", memberId)
      .eq("org_id", orgId)
      .single();

    if (!member) {
      return new Response(JSON.stringify({ error: "Member not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (member.user_id === userId) {
      return new Response(JSON.stringify({ error: "Cannot remove yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verify org has stripe_sub_id
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_sub_id")
      .eq("id", orgId)
      .single();

    if (!org?.stripe_sub_id) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. STRIPE FIRST — decrement quantity
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const subscription = await stripe.subscriptions.retrieve(org.stripe_sub_id);
    const itemId = subscription.items.data[0].id;
    const currentQty = subscription.items.data[0].quantity ?? 1;
    const newQty = Math.max(1, currentQty - 1);

    log("Decrementing Stripe seat", { itemId, currentQty, newQty });

    await stripe.subscriptionItems.update(itemId, { quantity: newQty });
    log("Stripe seat decremented successfully");

    // 5. Only if Stripe succeeded — suspend member
    const { error: suspendErr } = await supabase
      .from("org_members")
      .update({ status: "suspended" })
      .eq("id", memberId);

    if (suspendErr) throw suspendErr;
    log("Member suspended", { memberId });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
