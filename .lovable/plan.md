

# Move Quantities Badge to Bottom Tab Bar

## Problem
The count badge is currently on the "View Quantities" toggle text (line 307). The user wants it on the "Quantities" tab button in the bottom tab bar instead.

## Scope
One file: `src/components/calculator/CalculatorLayout.tsx`

## Changes

1. **Remove badge from line 307** — strip the `{visibleAreaCount > 0 && <span ...>}` from the "View Quantities" toggle text

2. **Add badge to the Quantities tab button (line 368-383)** — make the button `relative` and add a positioned badge in the top-right corner of the tab, only when `visibleAreaCount > 0`:

```tsx
<button
  role="tab"
  ...
  className={cn(
    "flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold transition-all relative",
    ...
  )}
>
  {visibleAreaCount > 0 && (
    <span className="absolute top-1 right-1/4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
      {visibleAreaCount}
    </span>
  )}
  <svg ...>...</svg>
  Quantities
</button>
```

The badge appears as a small pill overlaid on the Quantities tab icon, visible regardless of which tab is active.

