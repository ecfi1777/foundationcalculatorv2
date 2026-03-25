

# Fix: Auto-create default draft area on first render

## Problem
On initial load, `activeTab` is `"footing"` but `activeAreaId` is `null`. No draft area exists, so the footing form renders nothing. The draft is only created when the user clicks a tab.

## Root Cause
`addArea()` is only called inside `CalculatorTabBar`'s click handlers — never on mount.

## Fix — 1 file

### `src/components/calculator/CalculatorTabBar.tsx`

Add a mount-time `useEffect` with guards:

```ts
useEffect(() => {
  // Only auto-create if there's no active area AND no areas at all
  // (prevents interference with project loading or post-save/discard empty state)
  if (!state.activeAreaId && state.areas.length === 0) {
    addArea(state.activeTab);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Why `state.areas.length === 0` guard matters

| Scenario | `activeAreaId` | `areas.length` | Result |
|---|---|---|---|
| Fresh page load | `null` | `0` | Creates draft — correct |
| After save/discard | `null` | `≥1` (saved areas exist) | Skips — correct |
| After project load | set by LOAD | `≥1` | Skips — correct |
| After RESET (sign-out) | `null` | `0` | Creates draft — correct (user is back to fresh state) |

### Scope
This applies to **whichever tab is default** (currently `"footing"`). It does not force Footings specifically — it respects `state.activeTab`. Since the initial state is always `"footing"`, that's what gets auto-created on a fresh session.

### Technical details
- The `areas.length === 0` check prevents duplicates: if areas already exist (loaded project, saved areas), no auto-create happens
- The `useEffect` runs once on mount (`[]` deps), so save/discard returning `activeAreaId` to `null` mid-session won't re-trigger it
- If a user saves an area and wants to start another, they click a tab — existing behavior, unchanged

