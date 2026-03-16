

# Phase 11A — Admin Dashboard Core (Updated Plan)

## Change from Previous Plan

**`verify_jwt = true`** for all 8 admin Edge Functions. This adds gateway-level JWT verification as a first-layer guard before the in-code `is_admin` check. Two layers of security: the locked gate (JWT at gateway) + the badge check (is_admin in code).

This means the admin Edge Functions will differ from existing functions (which use `verify_jwt = false` and validate manually). Since the gateway handles JWT verification, the functions still need to extract the user ID from the token to check `is_admin`. The function code will use `supabase.auth.getUser(token)` to get the authenticated user after the gateway has already confirmed the token is valid.

## Config — `supabase/config.toml`

Add 8 entries, all with `verify_jwt = true`:

```toml
[functions.admin-get-users]
verify_jwt = true

[functions.admin-get-organizations]
verify_jwt = true

[functions.admin-get-promo-codes]
verify_jwt = true

[functions.admin-create-promo]
verify_jwt = true

[functions.admin-update-promo]
verify_jwt = true

[functions.admin-deactivate-promo]
verify_jwt = true

[functions.admin-toggle-pro]
verify_jwt = true

[functions.admin-get-usage-stats]
verify_jwt = true
```

## Everything Else — Unchanged

The rest of the plan remains exactly as previously approved:

1. **Prerequisites** — Re-add shadcn/ui Table and Badge components
2. **Edge Functions (8)** — Same logic, same pattern. CORS + OPTIONS, extract Bearer token, `supabase.auth.getUser(token)` to get userId, service-role query to check `is_admin = true` → 403 if not, execute DB logic, return JSON
3. **Frontend** — `/admin` route in App.tsx via ProtectedRoute, Admin.tsx with sidebar nav, 4 section components (UsersSection, OrganizationsSection, PromoCodesSection, UsageStatsSection)
4. **All admin API calls** via `callEdgeFunction` helper — no direct Supabase client queries
5. **No database migration** needed
6. **No type changes** needed

