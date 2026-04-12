

# Add Vertical Spacing Below Calculator Section

## File: `src/pages/ConcreteCalculator.tsx` — line 108

Add `mb-16` to the calculator wrapper div.

**Current (line 108–111):**
```tsx
<div className={cn(
  "mx-auto transition-all duration-300",
  isExpanded ? "max-w-[1600px] px-6 min-h-[85vh]" : "max-w-5xl px-4"
)}>
```

**Updated:**
```tsx
<div className={cn(
  "mx-auto transition-all duration-300",
  isExpanded ? "max-w-[1600px] px-6 min-h-[85vh]" : "max-w-5xl px-4 mb-16"
)}>
```

The `mb-16` is added only in the non-expanded state (same branch as the rest of the non-expanded styling), so it won't affect workspace mode.

### No other changes
- No layout restructuring
- No calculator logic changes
- Single line edit

