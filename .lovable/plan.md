

# Add TakeoffPanel to SEO Concrete Calculator

## Overview
Two files changed. No other files modified.

1. **Create** `src/components/seo/TakeoffPanel.tsx` — self-contained panel mirroring QuantitiesPanel's visual structure
2. **Modify** `src/pages/ConcreteCalculator.tsx` — add two-column desktop layout with TakeoffPanel, accumulating entries

## File 1: `src/components/seo/TakeoffPanel.tsx` (new)

Self-contained component with:
- Exported `TakeoffEntry` interface (id, tab, label, volumeCy, withWasteCy, wastePct)
- Props: `entries`, `onRemove`, `onClear`
- Three zones matching QuantitiesPanel layout:
  - **Header**: pinned top with "Your Takeoff" title
  - **Scrollable list**: empty state (box icon + message) or entry cards with label, remove button, base quantity row, separator, waste row. Rebar entries show "LF" instead of "yd³"
  - **Pinned footer**: computed totals (concrete yd³ + rebar LF if > 0), Clear All button, CTA linking to `/auth`
- Only imports: react-router-dom (Link), lucide-react (Trash2), Button, Separator, cn

## File 2: `src/pages/ConcreteCalculator.tsx` (modify)

**Import changes:**
- Add: `useIsMobile`, `TakeoffPanel`, `TakeoffEntry`
- Remove: `Link` (now used only inside TakeoffPanel)

**State additions:**
- `isMobile = useIsMobile()`
- `entries` state array of `TakeoffEntry`

**handleCalculate rewrite:**
- Same calculation logic, but now builds a `TakeoffEntry` and appends to `entries` array
- Still sets `calculated = true` for confirmation flash

**New handlers:** `handleRemoveEntry`, `handleClearEntries`

**JSX restructure:**
- Outer wrapper: `min-h-screen flex flex-col` (unchanged)
- Inner content area becomes a flex row on desktop:
  - **Left column** (`flex-1`): page header, calculator card (button text → "Add to Takeoff →", confirmation flash replaces old results), Field Notes, FAQ, Related Calculators (all verbatim)
  - **Right column** (`w-[380px] sticky top-0`): TakeoffPanel on desktop
  - **Mobile**: columns stack, TakeoffPanel appears below calculator
- Old inline results blocks and CTA block removed entirely
- Related Calculators links use `Link` imported inside TakeoffPanel is separate; for the calculator page we need to keep Link for Related Calculators — actually, I'll re-check: the Related Calculators section uses `<Link>` directly. Since we're removing the `Link` import, we need to keep it. Let me adjust: **keep the `Link` import** since Related Calculators still uses it in this file.

**Correction on Link import**: Related Calculators section (lines 491-500) uses `<Link>`. The import must stay. The user's instruction says to remove it, but that would cause a compile error. I will keep the `Link` import to avoid a TypeScript error, as instructed to "stop and report" rather than work around errors.

## Technical Details

- No Supabase, useAuth, useProject, or useCalculatorState imports in either file
- All state remains local `useState`
- Desktop: `flex flex-row` with `flex-1` left + `w-[380px]` right (sticky)
- Mobile: stacked via `isMobile` conditional
- Entry IDs generated via `Date.now()-Math.random()`
- Totals computed inside TakeoffPanel from entries array

