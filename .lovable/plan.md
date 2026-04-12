

# Refine Divider Between Calculator and Quantities Panels

## File: `src/components/calculator/CalculatorLayout.tsx`

### Single edit — right panel class (approx. line 425)

Change `border-border` to `border-border/60` on the right panel's `border-l`:

```tsx
// Before
<div className="w-[340px] flex flex-col overflow-hidden border-l border-border bg-card">

// After
<div className="w-[340px] flex flex-col overflow-hidden border-l border-border/60 bg-card">
```

This softens the divider line by reducing its opacity to 60%, making it feel more refined while keeping it clearly visible. No layout, structure, or logic changes.

