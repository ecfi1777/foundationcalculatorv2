

# Phase 12C — Webhook Hardening, Dashboard RPC, Admin Overview, Payout Improvements (Final)

Two wording tightenings applied to the previously approved plan. All other sections unchanged.

---

## Updated Section: Webhook Hardening — `stripe-webhook/index.ts`

Modify `handleInvoicePaid`:

1. **Duplicate check**: Before inserting, query `affiliate_commissions` where `invoice_id = invoice.id`. If a record already exists, log and skip. The partial unique index on `invoice_id` enforces idempotency at the database level as a second guard.

2. **Referral lookup and conversion**: Find referral with `.in("status", ["signed_up", "converted"])`. If status is `signed_up`, update to `converted` (this is the conversion event — first paid invoice). If already `converted`, do not reconvert — proceed directly to commission creation.

3. **Commission validation**: Verify `commissionCents >= 0` and `commissionCents < amountPaid`. Skip if invalid, log error.

4. **Populate new columns**: Include `invoice_id: invoice.id` and `subscription_id: invoice.subscription` in the insert.

5. **Structured logging**: Log `affiliate_id`, `invoice_id`, `commission_amount`, `subscription_id` on creation.

**The referral conversion update and commission insert must be handled idempotently. If the referral is already converted, do not reconvert. If the commission for the invoice already exists, skip insert. Do not allow retry behavior from Stripe webhooks to create duplicate commissions.**

---

## Updated Section: Payout History — `PayoutHistoryTable.tsx`

Group paid commissions by `stripe_transfer_id`:

- If `stripe_transfer_id` is present: group rows, show Amount (sum of grouped commissions), Transfer ID, and Commissions count.
- **For the displayed date**: if grouped by `stripe_transfer_id`, show a representative paid date using the shared transfer payout date if consistent; otherwise use the latest `paid_at` within the grouped commissions. Keep the logic deterministic and documented in code comments.
- If `stripe_transfer_id` is null or missing: fall back to row-level display (one row per commission).

Do not invent payout batches. Derive counts only from actual data.

---

## All Other Sections — Unchanged

Everything else from the previously approved plan remains exactly as written:

- **Database migration**: Add `invoice_id`, `subscription_id` to `affiliate_commissions` (with partial unique index on `invoice_id`). Add `stripe_payouts_enabled`, `stripe_details_submitted`, `stripe_status_checked_at` to `affiliates`. Create RPC `get_affiliate_dashboard_stats(affiliate_id uuid)` with least-privileged implementation.
- **Dashboard RPC**: Replace 3 queries with single RPC call in `AffiliateDashboard.tsx`.
- **Stripe Connect caching**: 6-hour cache in `get-stripe-connect-status` using new `affiliates` columns.
- **Admin overview**: New `admin-get-affiliate-overview` edge function with admin auth, summary cards in `AffiliatesSection.tsx`.
- **Payout cron logging**: Add `execution_time_ms` to `monthly-affiliate-payout-trigger`.
- **Referral landing tracking**: Already implemented. Verify only, do not rebuild.
- **Red flags / implementation constraints**: All guardrails unchanged.

## Files Summary

| File | Action |
|------|--------|
| SQL migration | Add columns, partial unique index, create RPC |
| `supabase/functions/stripe-webhook/index.ts` | Harden with idempotent duplicate check, conversion logic, validation, new columns |
| `supabase/functions/get-stripe-connect-status/index.ts` | Add 6-hour cache |
| `supabase/functions/admin-get-affiliate-overview/index.ts` | Create |
| `supabase/functions/monthly-affiliate-payout-trigger/index.ts` | Add `execution_time_ms` |
| `supabase/config.toml` | Add `admin-get-affiliate-overview` entry |
| `src/pages/AffiliateDashboard.tsx` | Use RPC for metrics |
| `src/components/admin/AffiliatesSection.tsx` | Add overview summary cards |
| `src/components/affiliate/PayoutHistoryTable.tsx` | Group by `stripe_transfer_id` with deterministic date logic and row-level fallback |

