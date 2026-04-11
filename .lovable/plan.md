

# Fix Page Mode Panel Height & Narrow Workspace Width

## Changes

### 1. `src/pages/ConcreteCalculator.tsx` — Narrow Page Mode width
- Line 96: Change `max-w-7xl` to `max-w-6xl` for Page Mode

### 2. `src/components/calculator/CalculatorLayout.tsx` — Fix panel height alignment
- Line 412: Change `<main>` to use a fixed/stretch height approach: replace `flex flex-1 min-h-[500px]` with `flex min-h-[600px]` (or similar) so both children share a defined height
- Line 413: Ensure left column has `h-full` (already present)
- Line 418: The scroll area `flex-1 overflow-y-auto` needs to work within the column height — already has `flex-1`, confirm `min-h-0` is present so flex shrink works
- Line 427: Right panel already has `h-full flex flex-col` — confirm `QuantitiesPanel` fills it

The core issue is `flex-1` on `<main>` makes it grow based on parent, but the parent `flex flex-col bg-background` has no defined height. Fix: give `<main>` a concrete `min-h-[600px]` and ensure both columns stretch via `h-full`. Add `min-h-0` to the left column's scroll area to prevent content from overflowing the flex container.

### Files modified
- `src/pages/ConcreteCalculator.tsx` — 1 class change (max-w-7xl → max-w-6xl)
- `src/components/calculator/CalculatorLayout.tsx` — height alignment fixes on `<main>` and child containers

### Unchanged
- Workspace Mode width/behavior
- Calculator logic, mobile layout, text copy
