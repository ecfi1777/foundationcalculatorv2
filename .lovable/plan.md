

# Make export read-only for per-section stone

## Problem

`buildExportData.ts` currently imports `calcStoneBase` and recomputes stone tons per section inside the export layer (lines 10, 74–93). The spec requires the export to be read-only and consume already-computed values.

## Constraint discovered

The in-memory `CalcSection` type (`src/types/calculator.ts`) does **not** carry a `stoneTons` field. Only the DB row `sections.stone_tons` (written by the `recalculate-project` edge function) holds a stored value, and the export does not read from the DB — it runs off `CalcState`.

So "already computed" at the export layer means **computed once by the canonical `computeArea` path** (same source the Quantities Panel uses), not recomputed inside the export.

## Fix

### 1. Move per-section stone computation into `computeArea` (canonical path)

In `src/lib/computeArea.ts`, the slab branch already loops sections and calls `calcStoneBase` to build the area total. Capture each section's tonnage in that same loop and expose it on the result.

- Add a `sectionStoneTons: Map<string, number>` (keyed by `section.id`) to `AreaResult`.
- Populate it inside the existing slab stone loop. Only populate entries where `area.stoneEnabled === true`, `section.includeStone === true`, and `secSqft > 0`.
- The area total `stoneTons` continues to be the sum, unchanged — UI parity preserved.

### 2. Add the field to `AreaResult`

In `src/types/calculator.ts`, extend `AreaResult` with:
```ts
sectionStoneTons?: Map<string, number>;
```

### 3. Make `buildExportData.ts` strictly read-only

- Remove `import { calcStoneBase } from "@/lib/calculations/stoneBase";`
- Remove the per-section `calcStoneBase` call (lines 84–93).
- Replace with a lookup: `result.sectionStoneTons?.get(sec.id) ?? null`.
- Gating stays the same: include stone fields only when `area.stoneEnabled && sec.includeStone`.
- Volume per section still uses `calcSlabSection` — that is volume math, not stone, and is unchanged by this task.

### 4. No changes to

- `calcStoneBase` itself
- Area total / project total stone aggregation
- DB schema, `recalculate-project`, or hydration
- CSV/PDF formatting

## Files changed

1. `src/types/calculator.ts` — add `sectionStoneTons?: Map<string, number>` to `AreaResult`.
2. `src/lib/computeArea.ts` — populate `sectionStoneTons` in the existing slab stone loop.
3. `src/lib/export/buildExportData.ts` — drop `calcStoneBase` import + call; read from `result.sectionStoneTons`.

## Verification

- Slab with 2 sections, both stone-enabled, different waste pcts → each row's `stoneTons` matches Quantities Panel; sum equals area total.
- Section with `includeStone = false` → exported `stoneEnabled: false`, `stoneTons: null`.
- Area with `stoneEnabled = false` → no section reports stone.
- Export layer contains zero calls to `calcStoneBase` (grep confirms).
- Project totals unchanged from current behavior.

