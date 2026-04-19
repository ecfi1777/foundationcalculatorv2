

# Auth intent: refined cleanup semantics

## Cleanup matrix

| Trigger | Action |
|---|---|
| `Auth.tsx` mount with no user | Do nothing (intent must survive for CalculatorLayout) |
| `Auth.tsx` successful auth → navigate to `redirectTo` | **peek only**, do NOT clear (CalculatorLayout consumes) |
| `Auth.tsx` unmount via back button / manual nav away while still unauthenticated | `clearAuthIntent()` (abandoned flow) |
| `CalculatorLayout` mount with authenticated user + intent | `consumeAuthIntent()` → repopulate `pendingAction` |
| `AccountCreationModal` "Maybe later" / close | `clearAuthIntent()` |
| `SaveBanner` X dismiss | `clearAuthIntent()` |
| `useAuth` sign-out | `clearAuthIntent()` |

## Auth.tsx unmount logic (key detail)

Use a ref to track whether a successful auth occurred during the page's lifetime:

```ts
const successfulAuthRef = useRef(false);

// In the effect that watches `user` and navigates:
useEffect(() => {
  if (user) {
    successfulAuthRef.current = true;
    const dest = peekAuthIntent()?.redirectTo ?? "/";
    navigate(dest, { replace: true });
  }
}, [user]);

// Cleanup on unmount:
useEffect(() => {
  return () => {
    if (!successfulAuthRef.current) {
      clearAuthIntent(); // only abandoned flow
    }
  };
}, []);
```

This guarantees:
- Successful login/signup → intent survives navigation → CalculatorLayout consumes it.
- User clicks browser back / navigates elsewhere without auth → intent cleared, no stale resume on later visits.

## Files changed (unchanged from prior plan)

1. **New** `src/lib/authIntent.ts` — `setAuthIntent`, `peekAuthIntent`, `consumeAuthIntent`, `clearAuthIntent`
2. `src/pages/Auth.tsx` — peek for redirect, `successfulAuthRef` + unmount cleanup, OAuth/email `redirectTo` → `/auth`
3. `src/components/calculator/CalculatorLayout.tsx` — write intent on save/new-project; consume on mount
4. `src/components/project/AccountCreationModal.tsx` — write on CTA, clear on dismiss
5. `src/components/calculator/SaveBanner.tsx` — write on Sign Up, clear on X
6. `src/hooks/useAuth.tsx` — `clearAuthIntent()` in sign-out

## Verification

1. Save → signup → resumes save on `/app` → reload → no reopen (consumed by CalculatorLayout, not Auth).
2. Save → reach `/auth` → click browser back without authenticating → revisit `/auth` later → lands on `/` (intent cleared on unmount).
3. Save → "Maybe later" → intent cleared.
4. OAuth round-trip → returns to `/auth` → success path preserves intent → `/app` resumes save.
5. Direct `/auth` visit, no intent → post-login lands on `/`.

