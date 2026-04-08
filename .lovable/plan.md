

# Fix: Phantom Areas + Project Title Reset on Navigation

## Problem
`CalculatorProvider` and `ProjectProvider` are mounted inside `Index.tsx`, so navigating away from `/` unmounts them, losing in-memory state. On return, empty draft areas get converted to non-drafts (phantom areas), and the project title resets.

## Changes

### File 1: `src/hooks/useCalculatorState.tsx`

**Replace `migrateLoadedState` (lines 207–231)** with the new implementation that:
- Uses a `for...of` loop instead of `.map()`
- Drops empty draft areas via `continue` (instead of setting `isDraft = false`)
- Resets `activeAreaId` to `null` if the referenced area was dropped
- Keeps the existing rebar migration logic

### File 2: `src/hooks/useProject.tsx`

**4 targeted changes:**

1. **Add constant** `const PROJECT_KEY = "tfc_current_project";` at module scope before `ProjectProvider` (before line 160)

2. **Add two `useEffect` hooks** after line 173 (after `clearPendingAction`):
   - One to persist `currentProject` to localStorage on change
   - One to restore `currentProject` from localStorage when `user` becomes non-null and `currentProject` is still null

3. **`resetToBlankInternal` (line 500–503)**: Add `localStorage.removeItem(PROJECT_KEY);`

4. **`clearAllState` (line 507–513)**: Add `localStorage.removeItem(PROJECT_KEY);`

No other files are modified.

