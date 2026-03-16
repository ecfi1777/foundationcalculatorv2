/**
 * Shared affiliate payout logic.
 * Used by both `run-affiliate-payout` (admin-triggered) and
 * `monthly-affiliate-payout-trigger` (cron-triggered).
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

export interface PayoutSummary {
  paid_affiliates: number;
  skipped_affiliates: number;
  failed_affiliates: number;
  total_amount_cents: number;
  message?: string;
}

export async function executeAffiliatePayout(
  supabase: SupabaseClient,
  stripe: Stripe
): Promise<PayoutSummary> {
  // Batch snapshot: select only id, affiliate_id, amount_cents
  const { data: pendingRows, error: pendErr } = await supabase
    .from("affiliate_commissions")
    .select("id, affiliate_id, amount_cents")
    .eq("status", "pending")
    .is("stripe_transfer_id", null);

  if (pendErr) throw pendErr;

  if (!pendingRows || pendingRows.length === 0) {
    return {
      paid_affiliates: 0,
      skipped_affiliates: 0,
      failed_affiliates: 0,
      total_amount_cents: 0,
      message: "No pending commissions found",
    };
  }

  // Group by affiliate_id
  const grouped: Record<string, { id: string; amount_cents: number }[]> = {};
  for (const row of pendingRows) {
    if (!grouped[row.affiliate_id]) {
      grouped[row.affiliate_id] = [];
    }
    grouped[row.affiliate_id].push({
      id: row.id,
      amount_cents: row.amount_cents,
    });
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

  return {
    paid_affiliates,
    skipped_affiliates,
    failed_affiliates,
    total_amount_cents,
  };
}
