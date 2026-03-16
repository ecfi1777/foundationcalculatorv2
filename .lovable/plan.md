

# Fix: Logout Must Fully Reset State and Redirect

## Changes

### 1. `src/hooks/useProject.tsx` — Add `clearAllState()` to context

New function exposed via context that performs a complete teardown:

```typescript
const clearAllState = useCallback(() => {
  dispatch({ type: "RESET" });
  setCurrentProject(null);
  setProjects([]);
  setSubscriptionTier("free");
  setPendingAction(null);
}, [dispatch]);
```

Add `clearAllState` to `ProjectContextType` interface and the Provider's value.

### 2. `src/components/calculator/AppHeader.tsx` — Accept `onSignOut` prop

- Add `onSignOut?: () => void` to `AppHeaderProps`
- Replace `onClick={signOut}` on the Sign Out menu item with `onClick={onSignOut}`
- Remove `signOut` from the `useAuth()` destructure (keep `user` only)

### 3. `src/components/calculator/CalculatorLayout.tsx` — Orchestrate logout

Add a `handleSignOut` that:

1. Calls `clearAllState()` — wipes projects, calculator, subscription tier from memory
2. Calls `localStorage.removeItem("tfc_calculator_state")` — ensures no stale anon scratch data survives from the authenticated session
3. Wraps `signOut()` in try/catch — if it fails, log the error and show a toast ("Signed out locally, but session cleanup failed"), but still proceed
4. Navigates to `"/"` unconditionally (after clearing state, regardless of signOut success)

```typescript
const handleSignOut = useCallback(async () => {
  clearAllState();
  localStorage.removeItem("tfc_calculator_state");
  try {
    await signOut();
  } catch (err) {
    console.error("Sign-out error:", err);
    toast.error("Signed out locally, but session cleanup failed. Please clear your browser data if issues persist.");
  }
  navigate("/");
}, [clearAllState, signOut, navigate]);
```

Pass `onSignOut={handleSignOut}` in `headerProps`.

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useProject.tsx` | Add `clearAllState` to context interface and provider |
| `src/components/calculator/AppHeader.tsx` | Add `onSignOut` prop, use it for Sign Out click |
| `src/components/calculator/CalculatorLayout.tsx` | Create `handleSignOut` with full state reset, error handling, and unconditional navigation |

