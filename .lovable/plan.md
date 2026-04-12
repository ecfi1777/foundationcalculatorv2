

# Fix Inconsistent Divider Between Calculator and Quantities Panels

Yes — this is exactly the plan. Three edits in `src/components/calculator/CalculatorLayout.tsx`:

1. **Line 412 (`<main>`)**: Add `rounded-xl border border-border` to the outer wrapper
2. **Line 414 (left panel)**: Remove `rounded-l-xl border border-border`, keep only `bg-card/60`
3. **Line 425 (right panel)**: Remove `rounded-r-xl`, keep `border-l border-border bg-card`

This eliminates the double-border between panels by moving the outer shell to `<main>` and using a single `border-l` as the internal divider.

No changes to layout structure, calculator logic, mobile layout, or footer styling.

