import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } }
);

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

// ─── Helper: find org by stripe_customer_id ───
async function findOrgByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();
  if (error || !data) throw new Error(`Org not found for customer ${customerId}`);
  return data;
}

// ─── 1. checkout.session.completed ───
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  log("checkout.session.completed", { customerId, subscriptionId });

  // Fetch the subscription to get seat count
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const seatCount = subscription.items.data[0]?.quantity ?? 1;

  // Find org — it may already have stripe_customer_id, or we need to match by owner email
  let org: any;
  const { data: existingOrg } = await supabase
    .from("organizations")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (existingOrg) {
    org = existingOrg;
  } else {
    // Look up customer email from Stripe, then find user → org
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    const email = customer.email;
    if (!email) throw new Error("Stripe customer has no email");

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    if (!user) throw new Error(`No user found for email ${email}`);

    const { data: foundOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    if (!foundOrg) throw new Error(`No org found for user ${user.id}`);
    org = foundOrg;
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      subscription_tier: "pro",
      subscription_status: "active",
      seat_count: seatCount,
      stripe_customer_id: customerId,
      stripe_sub_id: subscriptionId,
    })
    .eq("id", org.id);

  if (error) throw error;
  log("Org upgraded to pro", { orgId: org.id, seatCount });
}

// ─── 2. customer.subscription.updated ───
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  log("customer.subscription.updated", { customerId, status: subscription.status });

  const org = await findOrgByCustomer(customerId);
  const seatCount = subscription.items.data[0]?.quantity ?? 1;

  // Map Stripe status to our status
  let status = "active";
  if (subscription.status === "past_due") status = "past_due";
  else if (subscription.status === "canceled" || subscription.status === "unpaid") status = "cancelled";
  else if (subscription.status === "trialing") status = "trialing";

  const { error } = await supabase
    .from("organizations")
    .update({
      seat_count: seatCount,
      subscription_status: status,
    })
    .eq("id", org.id);

  if (error) throw error;
  log("Org subscription updated", { orgId: org.id, seatCount, status });
}

// ─── 3. customer.subscription.deleted ───
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  log("customer.subscription.deleted", { customerId });

  const org = await findOrgByCustomer(customerId);

  // Downgrade org to free
  const { error: updateErr } = await supabase
    .from("organizations")
    .update({
      subscription_tier: "free",
      subscription_status: "cancelled",
      stripe_sub_id: null,
      seat_count: 1,
    })
    .eq("id", org.id);
  if (updateErr) throw updateErr;

  // Lock all projects except the oldest one
  const { data: projects } = await supabase
    .from("projects")
    .select("id, created_at")
    .eq("org_id", org.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (projects && projects.length > 1) {
    const projectIdsToLock = projects.slice(1).map((p) => p.id);
    const { error: lockErr } = await supabase
      .from("projects")
      .update({ is_locked: true })
      .in("id", projectIdsToLock);
    if (lockErr) throw lockErr;
    log("Locked excess projects", { count: projectIdsToLock.length });
  }

  // Revoke all pending invites
  const { error: inviteErr } = await supabase
    .from("org_invites")
    .update({ status: "revoked" })
    .eq("org_id", org.id)
    .eq("status", "pending");
  if (inviteErr) throw inviteErr;

  log("Org downgraded to free", { orgId: org.id });
}

// ─── 4. invoice.payment_failed ───
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  log("invoice.payment_failed", { customerId, invoiceId: invoice.id });

  const org = await findOrgByCustomer(customerId);

  // Set status to past_due
  const { error } = await supabase
    .from("organizations")
    .update({ subscription_status: "past_due" })
    .eq("id", org.id);
  if (error) throw error;

  // Get owner email
  const { data: owner } = await supabase
    .from("users")
    .select("email")
    .eq("id", org.owner_id)
    .single();

  if (owner?.email && org.stripe_customer_id) {
    try {
      // Generate dynamic Stripe customer portal URL
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: org.stripe_customer_id,
        return_url: Deno.env.get("VITE_APP_URL") || "https://foundationcalculatorv2.lovable.app",
      });
      const portalUrl = portalSession.url;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Total Foundation Calculator <billing@totalfoundationcalculator.com>",
          to: [owner.email],
          subject: "Payment failed for your Total Foundation Calculator subscription",
          html: `
            <h2>Payment Failed</h2>
            <p>Hi,</p>
            <p>We were unable to process payment for your <strong>${org.name}</strong> subscription.</p>
            <p>Please update your payment method to avoid service interruption:</p>
            <p><a href="${portalUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Update Payment Method</a></p>
            <p>If you have questions, please contact our support team.</p>
          `,
        }),
      });
      const result = await res.json();
      log("Payment failure email sent", { to: owner.email, result });
    } catch (emailErr) {
      log("Failed to send payment failure email", { error: String(emailErr) });
    }
  }

  log("Org set to past_due", { orgId: org.id });
}

// ─── 5. invoice.paid ───
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const amountPaid = invoice.amount_paid; // in cents
  log("invoice.paid", { customerId, invoiceId: invoice.id, amountPaid });

  if (!amountPaid || amountPaid === 0) {
    log("Zero-amount invoice, skipping affiliate commission");
    return;
  }

  const org = await findOrgByCustomer(customerId);

  // Check if the org owner was referred
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, affiliate_id, status")
    .eq("referred_user_id", org.owner_id)
    .in("status", ["signed_up", "converted"])
    .maybeSingle();

  if (!referral) {
    log("No active referral for this org owner, skipping commission");
    return;
  }

  // Get affiliate commission percentage
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, commission_pct")
    .eq("id", referral.affiliate_id)
    .single();

  if (!affiliate) {
    log("Affiliate not found", { affiliateId: referral.affiliate_id });
    return;
  }

  const commissionCents = Math.floor(amountPaid * (affiliate.commission_pct / 100));

  const periodStart = invoice.period_start
    ? new Date(invoice.period_start * 1000).toISOString()
    : new Date().toISOString();
  const periodEnd = invoice.period_end
    ? new Date(invoice.period_end * 1000).toISOString()
    : new Date().toISOString();

  const { error } = await supabase.from("affiliate_commissions").insert({
    affiliate_id: affiliate.id,
    referral_id: referral.id,
    amount_cents: commissionCents,
    period_start: periodStart,
    period_end: periodEnd,
    stripe_payment_id: invoice.payment_intent as string | null,
    status: "pending",
  });

  if (error) throw error;

  // Update referral status to converted if first payment
  if (referral.status === "signed_up") {
    await supabase
      .from("referrals")
      .update({ status: "converted", converted_at: new Date().toISOString() })
      .eq("id", referral.id);
  }

  // Increment affiliate totals atomically
  await supabase.rpc("increment_affiliate_earnings", {
    affiliate_row_id: affiliate.id,
    amount: commissionCents,
  });

  log("Affiliate commission created", {
    affiliateId: affiliate.id,
    commissionCents,
    referralId: referral.id,
  });
}

// ─── Main handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      log("Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      log("Signature verification failed", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    log("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        log("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ received: true, error: msg }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
