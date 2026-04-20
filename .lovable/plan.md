

# Replace v2.2.1 rebar engine with v2.3 in shared engine + barrel

## Two-file edit

**1. `shared/calculations/index.ts`**
- **CHANGE 1-A**: Replace the four rebar type-declaration blocks (`RebarHorizontalInput/Result`, `RebarVerticalInput/Result`, `RebarSlabGridInput/Result`) with v2.3 versions that add optional `insetIn?` to H/Grid inputs, optional `barLengthFt?` to Vertical input, `piecesTotal` to all three results, `splicesPerRow` to Horizontal result. Add new `RebarLBarInput` and `RebarLBarResult` interfaces.
- **CHANGE 1-B**: Replace the entire rebar implementations block. Add new `calcPieceCount` primitive (Scenario B — overlap inside steel run). Rewrite `calcRebarHorizontal`, `calcRebarVertical`, `calcRebarSlabGrid` per v2.3 with inset and piece-count math. Add new `calcRebarLBar` per §8.12.
- Leave `calcSpliceOverlap` defined and exported unchanged (now unused, removal out of scope).
- Leave all non-rebar code (utilities, volume calculators, stone) untouched.

**2. `src/lib/calculations/index.ts`** (barrel re-export)
- **CHANGE 2-A**: Add `calcRebarLBar` and `calcPieceCount` to runtime export list (after `calcRebarSlabGrid`).
- **CHANGE 2-B**: Add `RebarLBarInput, RebarLBarResult` to type export list (after `RebarSlabGridInput, RebarSlabGridResult`).

## Out of scope (do NOT touch)
- `supabase/functions/_shared/calculations.ts` and any edge function (separate prompt)
- Every file in `src/lib/calculations/` other than `index.ts` (rebar.ts, utils.ts, slab.ts, footing.ts, wall.ts, curbGutter.ts, cylinder.ts, gradeBeam.ts, pierPad.ts, steps.ts, stoneBase.ts, types.ts)
- `src/lib/calculations/__tests__/` (separate prompt)
- `src/lib/computeArea.ts` (compiles unchanged thanks to optional fields)
- All UI components, schema, migrations, non-rebar formulas
- `calcSpliceOverlap`, `toTotalInches`, `inchesToFeet`, `cubicFtToCy`, `applyWaste`

## Verification
1. Only the two listed files modified.
2. `shared/calculations/index.ts` exports all 5: `calcPieceCount`, `calcRebarHorizontal`, `calcRebarVertical`, `calcRebarSlabGrid`, `calcRebarLBar`.
3. `calcSpliceOverlap` still exported, unchanged.
4. All v2.3 type fields present (`insetIn?`, `piecesTotal`, `splicesPerRow`, optional `barLengthFt?`, full `RebarLBar*` types).
5. Barrel re-exports new runtime + type symbols.
6. `tsc --noEmit` passes (optional fields keep `computeArea.ts` and edge function compiling).
7. Existing local tests still compile (they import from stale local modules, unchanged).
8. No changes under `supabase/functions/`.
9. No changes in `src/lib/calculations/` other than `index.ts`.
10. No changes to `src/lib/computeArea.ts`.

