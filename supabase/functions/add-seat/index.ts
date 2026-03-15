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
  console.log(`[ADD-SEAT] ${step}${d}`);
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

    const { orgId, email } = await req.json();
    if (!orgId || !email) {
      return new Response(JSON.stringify({ error: "orgId and email are required" }), {
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
      return new Response(JSON.stringify({ error: "Only the org owner can invite members" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Verify pro tier
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (!org) {
      return new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (org.subscription_tier !== "pro" || org.subscription_status !== "active") {
      return new Response(JSON.stringify({ error: "Team invites require a Pro subscription" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!org.stripe_sub_id) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. STRIPE FIRST — increment quantity
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const subscription = await stripe.subscriptions.retrieve(org.stripe_sub_id);
    const itemId = subscription.items.data[0].id;
    const currentQty = subscription.items.data[0].quantity ?? 1;

    log("Incrementing Stripe seat", { itemId, currentQty, newQty: currentQty + 1 });

    await stripe.subscriptionItems.update(itemId, { quantity: currentQty + 1 });
    log("Stripe seat incremented successfully");

    // 4. Only if Stripe succeeded — create invite
    const inviteToken = crypto.randomUUID();
    const { data: invite, error: inviteErr } = await supabase
      .from("org_invites")
      .insert({
        org_id: orgId,
        invited_by: userId,
        email,
        token: inviteToken,
        status: "pending",
      })
      .select("id")
      .single();

    if (inviteErr) throw inviteErr;
    log("Invite created", { inviteId: invite.id });

    // Send invite email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const appUrl = Deno.env.get("VITE_APP_URL") || "https://foundationcalculatorv2.lovable.app";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Total Foundation Calculator <noreply@totalfoundationcalculator.com>",
          to: [email],
          subject: "You've been invited to join a team on Total Foundation Calculator",
          html: `
            <h2>You've been invited!</h2>
            <p>You've been invited to join a team on Total Foundation Calculator.</p>
            <p><a href="${appUrl}/auth?invite=${inviteToken}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Accept Invite</a></p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          `,
        }),
      });
      const result = await res.json();
      log("Invite email sent", { to: email, result });
    } catch (emailErr) {
      log("Failed to send invite email (invite still created)", { error: String(emailErr) });
    }

    return new Response(JSON.stringify({ success: true, inviteId: invite.id }), {
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
