

# Phase 12B — Stripe Connect Onboarding + Monthly Payout Cron (Final)

**One pre-implementation fix**: `VITE_APP_URL` is referenced by 4 existing edge functions but is **not configured as a secret** — they all hit the hardcoded fallback. Will add it as a secret before proceeding.

## 0. Secrets Setup

- **`VITE_APP_URL`** — add via `add_secret`, value: `https://foundationcalculatorv2.lovable.app` (fixes existing functions too)
- **`CRON_SECRET`** — add via `add_secret`, random string for cron auth

## 1. `create-stripe-connect-onboarding-link` (Create)

`verify_jwt = true`. Auth user → load affiliate → create/reuse Stripe Express account → save `stripe_connect_id` → create account link with `refresh_url`/`return_url` from `VITE_APP_URL` → return `{ url }`.

## 2. `get-stripe-connect-status` (Create)

`verify_jwt = true`. Auth user → load affiliate → if no `stripe_connect_id` return `{ connected: false, ... }` → else `stripe.accounts.retrieve()` → return `{ connected, payouts_enabled, details_submitted, stripe_connect_id }`.

## 3. Shared Payout Module (Create)

**`supabase/functions/_shared/affiliatePayout.ts`** — extract core payout logic from `run-affiliate-payout` (snapshot pending commissions → group by affiliate → Stripe transfers → update rows → increment earnings → return summary).

## 4. Refactor `run-affiliate-payout` (Modify)

Keep admin auth check. Replace inline payout logic with call to shared `executeAffiliatePayout()`.

## 5. `monthly-affiliate-payout-trigger` (Create)

`verify_jwt = false`. Validate `x-cron-secret` header against `CRON_SECRET` env → reject 401 if invalid → call shared `executeAffiliatePayout()` → return summary.

## 6. Cron Schedule (SQL)

Enable `pg_cron` + `pg_net` extensions. Schedule `monthly-affiliate-payout` at `0 6 1 * *` calling the trigger endpoint with `x-cron-secret` header.

## 7. Dashboard Updates (Modify `AffiliateDashboard.tsx`)

Replace placeholder banner with dynamic card calling `get-stripe-connect-status` on mount:
- **No Stripe ID**: "Connect Stripe" button → calls onboarding link → redirect
- **Incomplete**: "Continue Stripe Setup" button → same flow
- **Ready**: Green "Payouts enabled" success card

## 8. Config (`supabase/config.toml` — Append)

```toml
[functions.create-stripe-connect-onboarding-link]
verify_jwt = true

[functions.get-stripe-connect-status]
verify_jwt = true

[functions.monthly-affiliate-payout-trigger]
verify_jwt = false
```

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/_shared/affiliatePayout.ts` | Create |
| `supabase/functions/create-stripe-connect-onboarding-link/index.ts` | Create |
| `supabase/functions/get-stripe-connect-status/index.ts` | Create |
| `supabase/functions/monthly-affiliate-payout-trigger/index.ts` | Create |
| `supabase/functions/run-affiliate-payout/index.ts` | Refactor to use shared module |
| `supabase/config.toml` | Append 3 entries |
| `src/pages/AffiliateDashboard.tsx` | Replace placeholder with Stripe Connect UI |
| Database | Enable `pg_cron` + `pg_net`, add cron schedule |

