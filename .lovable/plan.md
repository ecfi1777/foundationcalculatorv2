

# Replace `src/pages/ConcreteCalculator.tsx` — Multi-Tab SEO Calculator

## What changes
**Single file replacement:** `src/pages/ConcreteCalculator.tsx`

The current single-tab slab-only calculator page will be replaced with a multi-tab calculator supporting **Slab**, **Footing**, **Wall**, and **Rebar** tabs. Each tab has its own independent waste state (defaulting to "10"), its own inputs, formula display, and results section.

## Key differences from current file
- Remove `const WASTE_PCT = 10` — each tab gets its own `xWaste` state
- Remove `CardHeader`/`CardTitle` imports (tab bar replaces the card header)
- Add imports: `cn`, `calcFooting`, `calcWall`, `calcRebarSlabGrid`, and their result types
- Add `CalcTab` type and `TABS` array for the tab bar
- Four sets of input state + result state (slab, footing, wall, rebar)
- `handleCalculate` dispatches to the correct calc function based on `activeTab`
- `formulaMap` record for static formula strings per tab
- Waste labels show the user's entered value (`{slabWaste || 0}%`) not hardcoded "10%"
- SEO description updated to remove "10% waste factor" reference (now says "waste factor adjustable")
- Field notes updated: "Most contractors order **10% extra**" instead of "Always order 10% extra"
- FAQ answer updated to mention adjustable waste
- No app-internal hooks imported (no useAuth, useProject, etc.)

## No other files modified

