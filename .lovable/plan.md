

# Refine "Real-World Example" section on `/concrete-calculator`

## Single file change: `src/pages/ConcreteCalculator.tsx`

### 1. Replace `exampleAreas` data array (lines 67-76)

Replace with a new `projectAreas` array matching the requested example:

```ts
const projectAreas = [
  { name: "Basement Footing", measure: "200 LF", yards: "6.58 yd³" },
  { name: "Frost Footing", measure: "35 LF", yards: "3.24 yd³" },
  { name: "Foundation Walls", measure: "235 LF", yards: "46.42 yd³" },
  { name: "Basement Slab", measure: "3,375 SF", yards: "41.67 yd³" },
  { name: "Detached Garage", measure: "120 LF", yards: "4.54 yd³" },
];
const projectTotal = "103.11 yd³";
```

### 2. Rewrite Section 3 JSX (lines 239-272)

- Keep H2 title: "What a real foundation takeoff looks like"
- Replace intro paragraph with: "A real job isn't one number — it's a set of areas that all roll into one total."
- Remove the grid of 6-8 area cards
- Replace with a single `Card` containing:
  - Header: "Project: Basement + Garage" (bold, small label style)
  - List of 5 rows, each showing area name on the left, measure + yards on the right, separated by a subtle border-bottom
  - A divider line (`border-t`)
  - Total row: bold "Total" on left, "103.11 yd³" on right
- Below the card, one closing line: "Change one area and the total updates — without redoing the rest."

### 3. Styling

- Card uses existing `Card` component, max-w-lg, centered
- Each row: `flex justify-between`, `py-2 border-b border-border last:border-0`
- Area name: `text-sm font-medium text-foreground`
- Measure + yards: `text-sm text-muted-foreground` (measure) and `text-sm font-medium text-foreground` (yards)
- Total row: `font-semibold`, slightly larger or same size
- Mobile: single column, naturally responsive

### What stays unchanged
- H2 title text
- All other sections (hero, differentiator, Phase 2 sections)
- Calculator logic, providers, state, routing
- No new components or dependencies

