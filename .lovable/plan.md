

# Phase 7d — Server canonical L-Bar + Quantities display + Export

Final Phase 7 commit. Wires L-Bar through server recalc, Quantities UI, and exports. No UI input changes, no schema changes.

## Files (7)

### 1. `supabase/functions/recalculate-project/index.ts`
- Add `calcRebarLBar` to the `_shared/calculations.ts` import.
- Extend per-rebar-config compute loop with `lbar_total_lf`:
  - Non-slab branch: if `rc.lbar_enabled`, compute `lbarLinearFt` = `totalLinearFt` by default; for pier pads (`et === "pier_pad" && area.calculator_type === "pier_pad"`), use `Σ(2×(len+wid)) × quantity` across sections (mirrors `computeArea.ts`).
  - Call `calcRebarLBar({ linearFt, spacing/vert/bend/overlap/inset/waste from rc, barLengthFt: 20 })` when `lbarLinearFt > 0`.
  - `.update()` payload gains `lbar_total_lf`; `rebarOutput[et]` gains `lbar_total_lf`.
- Slab branch: unchanged (no L-Bar on slab per spec §8.12).

### 2. `src/hooks/useProject.tsx` — reconciliation
- Extend the post-save `rebarPatch` merge loop so `lbarTotalLf: t.lbar_total_lf ?? 0` flows back to local state alongside existing H/V/grid reconciliation.

### 3. `src/components/calculator/QuantitiesPanel.tsx`
- **Project totals aggregator**: include `rr.lbarLf ?? 0` in the `rebarLf` sum.
- **Per-area rebar rendering**: insert L-Bar row between Vertical and Grid (spec §9 ordering: Horiz → Vert → L-Bar → Grid). Label `{prefix}L-Bar ({barSize} @ {spacing}")`.
- Append ` · {N} pcs` inline to each existing LF value (Horiz/Vert/Grid) and the new L-Bar row when `*PiecesTotal > 0`. Single inline span, no separate row.

### 4. `src/types/export.ts`
- Add three fields to `AreaExportData` between vert and grid blocks: `rebarLBarLF: number | null`, `rebarLBarBarSize: string | null`, `rebarLBarSpacingIn: number | null`.

### 5. `src/lib/export/buildExportData.ts`
- Declare `rebarLBarLF / rebarLBarBarSize / rebarLBarSpacingIn` aggregators.
- In the `rebarResults` fold, accumulate `rr.lbarLf` and capture bar size + spacing.
- Include L-Bar in `areaRebarTotal` sum.
- Add the three L-Bar fields to the `areas.push({...})` payload between vert and grid entries.

### 6. `src/lib/export/pdfExport.ts`
- Insert L-Bar `<div>` between the Vert and Grid lines:
  `Rebar (L-Bar {barSize} @ {spacing}"): {fmtRebar(LF)} LF`.

### 7. `src/lib/export/csvExport.ts`
- Extend per-area `rebarTotal` inline sum to include `(area.rebarLBarLF ?? 0)`.

## Invariants (unchanged)
- `shared/calculations/index.ts`, `_shared/calculations.ts`, `types/calculator.ts`, `types/database.ts`, `computeArea.ts`, all UI forms + RebarAddon/FieldInfoIcon/NumberField, `useCalculatorState.tsx`, `useProject.tsx` (mapDbRebarToConfig + upsert), all tests — untouched. Test count stays 67.
- Rebar ordering everywhere: Horiz → Vert → L-Bar → Grid.
- piecesTotal format: ` · {N} pcs` inline suffix.
- Slab, Curb unaffected (no L-Bar branch reachable for them).

## Verification
1. Client + edge function build clean; `npm test` 67/67.
2. Deploy `recalculate-project`; no deploy errors.
3. Footing + H+V+L-Bar: Quantities shows 3 rows in order Horiz/Vert/L-Bar, each with ` · N pcs` suffix.
4. Pier pad L-Bar: client LF pre-save matches; after save, DB `lbar_total_lf > 0` on `element_type='pier_pad'` row; reload preserves LF (reconciliation works).
5. Wall / Grade Beam with L-Bar: same round-trip works.
6. Curb + Slab: `lbar_enabled=false`, `lbar_total_lf=0`; grid/H/V unchanged.
7. PDF export: 4-line ordered rebar block per area including `Rebar (L-Bar #4 @ 12"): ... LF`.
8. CSV export: per-area rebar total and project-totals row include L-Bar LF (pier-pad-only projects show nonzero rebar column).
9. Project totals footer sums all four rebar types.
10. Pre-7d projects load without error; re-save populates `lbar_total_lf`.
11. Empty pier pad (no dimensioned sections) with `lbar_enabled=true` → `lbar_total_lf=0`, no crash.

