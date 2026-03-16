

# Fix: Prevent stale session data from triggering migration on re-login

## Root cause

The persistence `useEffect` (useCalculatorState.tsx:229) runs on every state change and does two things:
1. Writes `tfc_calculator_state` to localStorage
2. Sets `tfc_anon_has_data = "true"` whenever `state.areas.length > 0`

This means when a logged-in user loads a DB project (LOAD action), the useEffect writes that project's data to localStorage AND marks it as "anonymous data." On logout, even though `handleSignOut` removes `tfc_calculator_state`, the useEffect fires one more time with pre-RESET state and rewrites it. On next login, `hasAnonData()` returns true and `migrateAnonData` creates a duplicate "My Project."

## Approved parts (keeping as-is from previous plan)

1. Clear both `tfc_calculator_state` and `tfc_anon_has_data` in `handleSignOut`
2. Synchronously clear localStorage keys on RESET dispatch

## Revised migration guard

Instead of "skip if user has projects" (which would discard legitimate anonymous work), distinguish anonymous edits from loaded-from-DB state using the existing `tfc_anon_has_data` flag — but fix when it gets set.

**Current bug**: `tfc_anon_has_data` is set in the useEffect whenever `areas.length > 0`, including after a LOAD from DB.

**Fix**: Only set `tfc_anon_has_data` when a user-initiated data action (ADD_AREA, UPDATE_AREA, etc.) occurs — never on LOAD or RESET. This way the flag truly represents "the user created anonymous work in this browser session."

## Changes

### 1. `src/hooks/useCalculatorState.tsx` — Two fixes

**a) Synchronous localStorage clear on RESET** (line ~217 in dispatch wrapper):
```typescript
if (action.type === "RESET") {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("tfc_anon_has_data");
}
```

**b) Move `tfc_anon_has_data` flag out of the useEffect** — set it in the dispatch wrapper only for DATA_ACTIONS:
```typescript
if (DATA_ACTIONS.has(action.type)) {
  isDirtyRef.current = true;
  setIsDirty(true);
  localStorage.setItem("tfc_anon_has_data", "true"); // ← moved here
}
```

Remove the `tfc_anon_has_data` line from the useEffect (line 232-233). The useEffect continues to persist `tfc_calculator_state` as before — that's fine for scratch pad functionality. The migration decision is based solely on the `tfc_anon_has_data` flag, which now only gets set by genuine user edits.

### 2. `src/components/calculator/CalculatorLayout.tsx` — Clear `tfc_anon_has_data` on logout

Add to `handleSignOut`:
```typescript
localStorage.removeItem("tfc_anon_has_data");
```

### 3. No change to `migrateAnonData.ts`

The existing `hasAnonData()` check in Auth.tsx already gates migration. With the flag now correctly representing only anonymous user edits, no additional guard is needed in `migrateAnonData` itself.

## Files changed

| File | Change |
|------|--------|
| `src/hooks/useCalculatorState.tsx` | Move `tfc_anon_has_data` to dispatch wrapper (DATA_ACTIONS only); sync-clear both keys on RESET |
| `src/components/calculator/CalculatorLayout.tsx` | Also remove `tfc_anon_has_data` in handleSignOut |

