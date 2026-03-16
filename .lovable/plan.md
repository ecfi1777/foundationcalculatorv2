

# Phase 12A — Affiliate Signup + Affiliate Dashboard

No database changes. All types (`Affiliate`, `Referral`, `AffiliateCommission`) already exist. Affiliate account creation goes through the `create-affiliate-account` Edge Function. Authenticated users read their own data via existing RLS policies.

## 1. Edge Function: `create-affiliate-account`

**Create: `supabase/functions/create-affiliate-account/index.ts`**

Same CORS + auth pattern as `admin-get-affiliates` (service role client, Bearer token auth via `supabase.auth.getUser`). No admin check — any authenticated user can call it.

Logic:
- Query `affiliates` where `user_id = user.id` — if exists, return it
- Generate random 8-char alphanumeric `referral_code`, check uniqueness, retry up to 5 times on collision
- Insert: `user_id`, `referral_code`, `referral_link` (`https://foundationcalculator.com?ref={code}`), `status: 'active'`, `total_referred: 0`, `total_earned_cents: 0`
- Return created row as JSON

**Config: `supabase/config.toml`** — append `[functions.create-affiliate-account]` with `verify_jwt = true`

## 2. Settings Page — Affiliate Section

**Modify: `src/pages/Settings.tsx`**

- Add state: `affiliate` (null or object), `affiliateLoading`, `affiliateCreating`
- In `fetchData`, query `affiliates` where `user_id = user.id` via `.maybeSingle()`
- After the Calculator Preferences card (after line 570's closing `</Card>`), add a new Card:
  - **No affiliate row**: Description text + "Become an Affiliate" button
  - **Has affiliate row**: "You're an affiliate" + Button linking to `/affiliate`
- Button calls `callEdgeFunction("create-affiliate-account", {}, session)`, on success navigates to `/affiliate`

## 3. Affiliate Dashboard

**Create: `src/pages/AffiliateDashboard.tsx`**

On mount:
1. Query `affiliates` where `user_id = auth.uid()` — if none, redirect to `/settings`
2. Query `referrals` where `affiliate_id = affiliate.id`:
   - **Total Signups** = count all
   - **Total Conversions** = count where `status = 'converted'`
   - **Active Referrals** = count where `status = 'converted'`
3. Query `affiliate_commissions` where `affiliate_id = affiliate.id`:
   - **Pending Commission** = sum `amount_cents` where `status = 'pending'`
   - **Payout History** = rows where `status = 'paid'` ordered by `paid_at desc`
4. **Total Earned** from `affiliate.total_earned_cents`
5. **Next Payout Date** = 1st of next month

Layout: Header with back arrow → Stripe Connect placeholder banner (if `stripe_connect_id` is null) → ReferralLinkCard → 6 metric cards grid → PayoutHistoryTable

All values default to `0` / `$0.00` / `"No payouts yet"`.

## 4. Components

**Create: `src/components/affiliate/ReferralLinkCard.tsx`**
- Props: `referralLink: string`
- Card with read-only input + "Copy" button + success toast

**Create: `src/components/affiliate/PayoutHistoryTable.tsx`**
- Props: `payouts: AffiliateCommission[]`
- Table: Date (`paid_at`), Amount (`amount_cents` as `$X.XX`), Stripe Transfer ID
- Empty state: "No payouts yet"

## 5. Route

**Modify: `src/App.tsx`** — add `<Route path="/affiliate" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />`

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/create-affiliate-account/index.ts` | Create |
| `supabase/config.toml` | Append entry |
| `src/pages/AffiliateDashboard.tsx` | Create |
| `src/components/affiliate/ReferralLinkCard.tsx` | Create |
| `src/components/affiliate/PayoutHistoryTable.tsx` | Create |
| `src/pages/Settings.tsx` | Add affiliate section after Calculator Preferences card |
| `src/App.tsx` | Add `/affiliate` route |

