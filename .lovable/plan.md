

# Remove Rebar from SEO Concrete Calculator

## Overview
Strip all rebar-related code from both files. No other files touched.

## File 1: `src/pages/ConcreteCalculator.tsx`

1. **Line 17**: Remove `calcRebarSlabGrid` from imports
2. **Line 23**: Remove `RebarSlabGridResult` from type imports
3. **Line 26**: Change `CalcTab` type to `"slab" | "footing" | "wall"`
4. **Line 32**: Remove `{ id: "rebar", label: "Rebar" }` from TABS
5. **Lines 70-78**: Delete all rebar state declarations (rebarL, rebarW, rebarSpacing, rebarWaste, rebarResult)
6. **Lines 153-174**: Delete rebar branch from `handleCalculate`
7. **Lines 222-227**: Delete rebar branch from `handleEditEntry`
8. **Line 252**: Remove `rebar` key from `formulaMap`
9. **Line 540**: Remove Rebar Calculator from Related Calculators links
10. **Lines 389-417**: Delete rebar inputs JSX block

## File 2: `src/components/seo/TakeoffPanel.tsx`

1. **Line 10**: Change tab type to `"slab" | "footing" | "wall"`
2. **Lines 29-32**: Remove rebar keys from inputs (rebarL, rebarW, rebarSpacing, rebarWaste)
3. **Lines 47-49**: Simplify `totalConcreteCy` — remove `.filter(...)`, just `.reduce(...)`
4. **Lines 51-53**: Delete `totalRebarLf` calculation
5. **Lines 167-174**: Replace rebar-conditional base quantity display with unconditional `Cubic Yards:` / `yd³`
6. **Lines 184-187**: Replace rebar-conditional waste display with unconditional `yd³`
7. **Lines 210-217**: Delete rebar total row from footer

