

# Phase 11B — Affiliate Admin Tools (Final Plan)

All prior details remain unchanged. This documents the two additional safeguards for `run-affiliate-payout`:

## Revision: Payout Row-Level Safety

### 1. Minimal column selection for batch snapshot

Query pending commissions selecting only what's needed:

```
SELECT id, affiliate_id, amount_cents
FROM affiliate_commissions
WHERE status = 'pending' AND stripe_transfer_id IS NULL
```

No extra columns. The grouped JS structure per affiliate becomes `{ affiliateId, rows: [{ id, amount_cents }] }`.

### 2. Post-update row count verification

After the `.update(...).in('id', commissionRowIds)` call, check the returned data length against `commissionRowIds.length`. If fewer rows were affected:

- Log a warning with the affiliate ID, expected count, and actual count
- Count that affiliate as `failed_affiliates` (the Stripe transfer already succeeded, but the DB state is inconsistent — this surfaces it for manual review)
- Do **not** call `increment_affiliate_earnings` for that affiliate

This ensures a race condition or unexpected row state change doesn't silently produce an inconsistent payout record.

### Updated per-affiliate payout pseudocode

```
for each affiliateGroup:
  rowIds = group.rows.map(r => r.id)
  totalCents = sum(group.rows.map(r => r.amount_cents))

  lookup affiliate.stripe_connect_id
  if null → skip

  try:
    transfer = stripe.transfers.create(...)

    { data } = supabase.from('affiliate_commissions')
      .update({ status: 'paid', paid_at: now(), stripe_transfer_id: transfer.id })
      .in('id', rowIds)
      .select('id')

    if data.length < rowIds.length:
      console.warn(`Affiliate ${affiliateId}: expected ${rowIds.length} rows updated, got ${data.length}`)
      failed_affiliates++
      continue

    supabase.rpc('increment_affiliate_earnings', { affiliate_row_id, amount: totalCents })
    paid_affiliates++
    total_amount_cents += totalCents

  catch:
    failed_affiliates++
    continue
```

## All Other Plan Details

Everything else — migration, config, `admin-get-affiliates`, frontend, types — remains exactly as previously approved. No changes.

## Files Summary

| File | Action |
|------|--------|
| DB migration | `ALTER TABLE affiliate_commissions ADD COLUMN stripe_transfer_id text NULL` |
| `supabase/config.toml` | Append 2 entries |
| `supabase/functions/admin-get-affiliates/index.ts` | Create |
| `supabase/functions/run-affiliate-payout/index.ts` | Create (with row-count verification) |
| `src/components/admin/AffiliatesSection.tsx` | Create |
| `src/pages/Admin.tsx` | Update (add affiliates tab) |
| `src/types/database.ts` | Add `stripe_transfer_id` to AffiliateCommission |

