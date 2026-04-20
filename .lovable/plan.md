

# Phase 7c — Pier Pad L-Bar rebar scaffold

Adds L-Bar-only rebar add-on to Pier Pad areas. No other area type touched. Client-side compute only (server canonical + QuantitiesPanel/exports are 7d).

## Files (3)

### 1. `src/components/calculator/RebarAddon.tsx`
- Widen `mode` prop type: `"linear" | "slab" | "lbar_only"`.
- Insert new `mode === "lbar_only"` render branch between the `linear` and `slab` branches.
- Renders the 8 L-Bar fields directly (no nested L-Bar checkbox — outer "Add Rebar" IS the L-Bar toggle, mirroring how `slab` treats the outer toggle as the grid toggle).
- Field order: Bar Size, Spacing, Vertical (ft) with ⓘ (HOLD_DOWN_INFO_CONTENT), Vertical (in), Bend Length, Overlap, Inset, Waste.
- `showLBar` prop ignored in this mode.

### 2. `src/components/calculator/PierPadForm.tsx`
- Import `RebarAddon` and `makeDefaultRebar`.
- Derive `pierPadRebar = area?.rebarConfigs?.pier_pad ?? makeDefaultRebar("pier_pad")` and `rebarEnabled = pierPadRebar.lbarEnabled`.
- Render `<RebarAddon mode="lbar_only" sectionLabel="Add Rebar" …>` below `<SectionEntry>`:
  - `onToggle(v)` → dispatch `UPDATE_REBAR` with `elementType: "pier_pad"`, `rebar: { lbarEnabled: v }`.
  - `onChange(patch)` → dispatch `UPDATE_REBAR` with `elementType: "pier_pad"`, `rebar: patch`.

### 3. `src/lib/computeArea.ts` — `computeRebarForElement` non-slab branch
- Define `lbarLinearFt`:
  - Default: `totalLinearFt` (footings/walls/gradeBeam/curb — no behavior change).
  - Pier pads (`area.type === "pierPad" && elementType === "pier_pad"`): `Σ (2 × (lengthFt + widthFt)) × quantity` across sections. Fraction map `{ "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 }` used to resolve inches+fraction into feet (matches existing fraction persistence convention).
- Restructure gate: keep H/V compute inside `if (totalLinearFt > 0)`; pull L-Bar compute out into its own gate `if (config.lbarEnabled && lbarLinearFt > 0)` using `lbarLinearFt` (so pier pads, which have `totalLinearFt = 0`, can still compute).
- L-Bar branch body unchanged otherwise (same `calcRebarLBar` call with `linearFt: lbarLinearFt`, same result assignments).

## Spec interpretation — pier pad L-Bar linearFt
Spec §8.12 says "equivalent dimension for pier pads" without defining it. Interpreted as **Σ perimeter × quantity**: L-bars wrap each pad's perimeter as dowels; total placement distance = perimeter of each section × area-level quantity, summed across sections. This interpretation lives only in `computeArea.ts` step 3.

## Out of scope (deferred)
- `recalculate-project` L-Bar server branch → 7d.
- QuantitiesPanel L-Bar line + piecesTotal display → 7d.
- PDF/CSV export of L-Bar → 7d.
- All other area forms (Footing/Wall/GradeBeam/Curb/Slab/Cylinder/Steps) — no changes.
- `RebarAddon` `linear` and `slab` branches, `FieldInfoIcon`, `NumberField`, `BarSizeSelect` — untouched.
- `useProject.tsx`, `useCalculatorState.tsx`, `types/calculator.ts` — already 7a-complete.
- Settings "Default Rebar Inset" → Phase 10. HowItWorks rewrite → Phase 13.
- Tests stay 35/35 green.

## Verification
1. Build clean; 35/35 tests pass.
2. Pier Pad area shows new "Add Rebar" card below Section list; toggling reveals exactly 8 L-Bar fields in spec order.
3. Defaults: `#4 / 12 / 0ft 0in / 12 / 12 / 3 / 0`; ⓘ on Vertical (ft) shows hold-down warning (desktop tooltip, mobile dialog).
4. 3×3 section × qty 4, Vertical=4ft → L-Bar LF > 0 in Quantities (perimeter 12 × 4 = 48 ft linearFt source).
5. DB round-trip: row with `element_type='pier_pad'`, `lbar_enabled=true`, all L-Bar columns persisted; reload restores values.
6. Footing/Wall/GradeBeam/Curb/Slab/Cylinder/Steps rebar UI unchanged (7b behavior preserved).
7. Mobile (≤768px): 2-col grid intact, ⓘ → Dialog.

