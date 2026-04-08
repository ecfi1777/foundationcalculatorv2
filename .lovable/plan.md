

# Admin Route Wrapper + Trial Extension

## ADDITION 1 — AdminRoute Component

### Create `src/components/AdminRoute.tsx`
- Wraps children with an is_admin check against the `users` table
- Uses `useAuth()` for session/user, plus a local `useState` for `isAdmin` and `checking`
- On mount (after user is available), queries `supabase.from("users").select("is_admin").eq("id", user.id).single()`
- While `loading` (auth) or `checking` (admin query): renders the same spinner as ProtectedRoute (`<div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading…</p></div>`)
- No user → `<Navigate to="/auth" replace />`
- User exists but not admin → `<Navigate to="/" replace />`
- Admin confirmed → render children

### Modify `src/App.tsx`
- Import `AdminRoute` from `@/components/AdminRoute`
- Change `/admin` route to use `<AdminRoute>` instead of `<ProtectedRoute>`
- No other routes changed; `ProtectedRoute` import stays

## ADDITION 2 — Trial Extension

### Create `supabase/functions/admin-extend-trial/index.ts`
Mirrors `admin-toggle-pro` exactly for CORS, auth, and admin check. Then:
- Parses `{ orgId, days }` from request body
- Validates `orgId` is a non-empty string (400 if missing)
- Validates `days` is integer 1–365 (400 if invalid)
- Computes `trial_ends_at = new Date(Date.now() + days * 86400 * 1000).toISOString()`
- Updates `organizations` where `id = orgId`: `subscription_tier='pro'`, `subscription_status='trialing'`, `trial_ends_at`
- Returns `{ success: true, trial_ends_at }`
- Catch block returns HTTP **200** with `{ error: message }` (matches existing admin pattern intent, per spec)

### Modify `src/components/admin/UsersSection.tsx`
- `org_id` is already present on the `AdminUser` interface — no data-fetching changes needed
- Add an "Extend Trial" button (`variant="outline"`, `size="sm"`) after the existing Toggle Pro / Revert to Free buttons, visible when `u.org_id` is truthy
- onClick: `window.prompt` → parse days → validate 1–365 → `adminCall("admin-extend-trial", { orgId: u.org_id, days })` → `toast.success` + `fetchUsers()` on success, `toast.error` on failure
- No new imports needed (toast from sonner already imported)

## Files touched (4 only)
1. `src/components/AdminRoute.tsx` — CREATE
2. `src/App.tsx` — MODIFY (swap wrapper on /admin)
3. `supabase/functions/admin-extend-trial/index.ts` — CREATE
4. `src/components/admin/UsersSection.tsx` — MODIFY

