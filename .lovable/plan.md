

# Fix Quantities Panel Height to Match Calculator Panel

## Problem
The `<main>` container uses `min-h-[600px]` which sets a minimum but doesn't establish an actual height that `h-full` children can reference. The left column grows with content via `flex-1`, but the right column's `h-full` has no concrete height to stretch to.

## Fix: `src/components/calculator/CalculatorLayout.tsx`

### Make both columns stretch equally via `stretch` (default) + remove `h-full`
The fix is to use `items-stretch` (flexbox default) on `<main>` and remove explicit `h-full` from both columns, letting them naturally stretch to the tallest sibling's height.

**Line 412** — Add `items-stretch` explicitly to `<main>`:
```
flex min-h-[600px] overflow-hidden
```
→
```
flex min-h-[600px] items-stretch overflow-hidden
```

**Line 427** — The right panel column: remove `h-full` (stretch handles it), keep everything else.

The QuantitiesPanel itself already has `flex flex-col h-full` with `flex-1` on the scrollable area and the totals footer anchored at the bottom — no changes needed there.

### Files modified
- `src/components/calculator/CalculatorLayout.tsx` — 2 small class tweaks on lines 412 and 427

### Unchanged
- QuantitiesPanel component
- Workspace Mode
- Calculator logic, mobile layout
- All text copy

