

# Replace rebar test suite with v2.3 worked examples

## Single-file edit: `src/lib/calculations/__tests__/rebar.test.ts`

Wholesale replace the file. The current tests are pinned to v2.2.1 formulas AND import from the stale local `../rebar` module — both wrong now that prompts 5-1/5-2 landed.

The new file:
- Imports from `@/lib/calculations` (the barrel → `shared/calculations/index.ts`, the live production path).
- Imports all five symbols: `calcPieceCount`, `calcRebarHorizontal`, `calcRebarVertical`, `calcRebarSlabGrid`, `calcRebarLBar`.
- Encodes v2.3 Master Spec worked examples verbatim across §8 / §8.9 / §8.10 / §8.11 / §8.12, including:
  - `calcPieceCount` Scenario B primitive (overlap inside the run)
  - Horizontal: 15/20/20.5/40/60 ft runs with 3″ inset, multi-row, waste, default-inset, inset=0, oversize-inset, invalid input
  - Vertical: full-bar charge per position; tall walls (22 ft) splice via Scenario B; default `barLengthFt`, waste, invalid input
  - Slab Grid: 16×10 @ 18″ → 378 LF / 18 pcs; 50×30 @ 12″ both-axis splice → 3800 LF / 190 pcs; default inset, inset=0, oversize-inset, invalid
  - L-Bar (NEW): Example 1 (4 ft + 12″ bend → 567 LF / 27 pcs); Example 2 (20 ft + 12″ hook → 1260 LF / 60 pcs); default inset, bend=0 degenerate, oversize-inset, invalid

## Out of scope (do NOT touch)
- All production source under `src/`, `shared/`, `supabase/functions/`
- Stale local duplicates: `src/lib/calculations/rebar.ts`, `utils.ts`, `types.ts` (separate cleanup prompt)
- Other test files (`utils.test.ts` etc. — `utils.test.ts` still pins the local stale `calcSpliceOverlap` and must continue to pass unchanged)
- `vitest.config.ts`, `tsconfig*.json`, `package.json`

## Verification
1. Only `rebar.test.ts` modified.
2. `grep` shows `from "@/lib/calculations"` (not `../rebar`).
3. All 5 symbols imported.
4. `vitest run src/lib/calculations/__tests__/rebar.test.ts` → all green.
5. Full `vitest run` still passes.
6. `tsc --noEmit` clean.
7. Key worked-example numbers present verbatim (Horizontal 40 ft → 60 LF / 3 pcs; Slab 16×10 → 378 LF / 18 pcs; L-Bar Ex1 → 567 LF / 27 pcs; L-Bar Ex2 → 1260 LF / 60 pcs).

