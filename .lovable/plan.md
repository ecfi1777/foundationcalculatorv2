

# Port v2.3 rebar engine to edge function shared calc

## Single-file edit: `supabase/functions/_shared/calculations.ts`

**CHANGE A** — Replace the four rebar type-declaration blocks (`RebarHorizontalInput/Result`, `RebarVerticalInput/Result`, `RebarSlabGridInput/Result`) with v2.3 versions:
- Add optional `insetIn?` to Horizontal & Grid inputs (default 3″)
- Make `barLengthFt?` optional in Vertical input (default 20′)
- Add `piecesTotal` to all three results
- Add `splicesPerRow` to Horizontal result
- Add new `RebarLBarInput` and `RebarLBarResult` interfaces

**CHANGE B** — Replace the rebar implementations block:
- Add new `calcPieceCount` primitive (Scenario B — overlap inside steel run)
- Rewrite `calcRebarHorizontal`, `calcRebarVertical`, `calcRebarSlabGrid` per v2.3 with inset subtraction (`linearFt − 2 × insetFt`) and piece-count math
- Add new `calcRebarLBar` per §8.12

This brings the edge-function copy to byte-for-byte parity with the already-updated `shared/calculations/index.ts`, so the upcoming Phase 5.1 recalculate-project migration writes v2.3 values rather than re-baking v2.2.1 numbers.

## Out of scope (do NOT touch)
- `shared/calculations/index.ts` (already at v2.3 — parity reference)
- All of `src/lib/calculations/**`
- `supabase/functions/recalculate-project/**` (picks up new logic automatically via import; no L-Bar wiring this phase)
- Any other edge function
- All non-rebar formulas (`calcFooting`, `calcWall`, `calcGradeBeam`, `calcCurbGutter`, `calcSlabSection`, `calcSlabArea`, `calcPierPad`, `calcCylinder`, `calcSteps`, `calcStoneBase`)
- `calcSpliceOverlap` (left defined, now unused)
- `toTotalInches`, `inchesToFeet`, `cubicFtToCy`, `applyWaste`

## Verification
1. Only `supabase/functions/_shared/calculations.ts` modified.
2. `grep` for `^export function calcRebar\|^export function calcPieceCount` returns 5 lines.
3. `calcSpliceOverlap` still exported (1 line).
4. All v2.3 type fields present (`insetIn?`, `piecesTotal`, `splicesPerRow`, optional `barLengthFt?`, full `RebarLBar*`).
5. Rebar section diffs clean against `shared/calculations/index.ts`.

