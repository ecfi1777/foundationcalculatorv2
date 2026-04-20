

# Phase 7a — Foundational v2.3 rebar types + persistence + client compute

Single interlocked commit. Zero UI/visual change. Lays the type + persistence + client-compute foundation for 7b/7c/7d.

## Files (4)

### 1. `src/types/calculator.ts`
- `RebarConfig`: add `hInsetIn`, `vInsetIn`, `gridInsetIn` (all `number`) + 10 L-Bar fields (`lbarEnabled`, `lbarBarSize`, `lbarSpacingIn`, `lbarVerticalFt`, `lbarVerticalIn`, `lbarBendLengthIn`, `lbarOverlapIn`, `lbarInsetIn`, `lbarWastePct`, `lbarTotalLf?`). Optional `?` only on `lbarTotalLf` (mirrors `hTotalLf` pattern).
- `makeDefaultRebar`: add inset defaults (3″) + L-Bar defaults per spec §8.12 (`lbarEnabled=false`, `lbarBendLengthIn=12`, `lbarInsetIn=3`, etc.).
- `deriveRebarEnabled`: include `lbarEnabled` in the OR.
- `getElementTypes`: `pierPad` → `["pier_pad"]` (was `["footing"]`).
- `calcTypeToElementType`: add explicit `pierPad → "pier_pad"` case; default stays `"footing"`.
- `RebarResult`: add `horizPiecesTotal`, `vertPiecesTotal`, `gridPiecesTotal` + L-Bar block (`lbarLf`, `lbarBarSize`, `lbarSpacingIn`, `lbarPiecesTotal`).

### 2. `src/lib/computeArea.ts`
- Import `calcRebarLBar` from `@/lib/calculations`.
- Rewrite `computeRebarForElement`:
  - Initialize all new `RebarResult` fields to `null`.
  - Always compute client-side so `piecesTotal` is populated; use server canonical `*TotalLf` only as display shortcut when > 0.
  - Pass `insetIn: config.hInsetIn` to `calcRebarHorizontal`.
  - Pass `insetIn: config.gridInsetIn` to `calcRebarSlabGrid`.
  - Vertical: no `insetIn` (spec §8.10).
  - New L-Bar branch (gated by `config.lbarEnabled`); inert pre-7c since `totalLinearFt=0` for pier pads.
- `computeArea` rebar gate: include `config.lbarEnabled` in OR.

### 3. `src/hooks/useProject.tsx`
- `mapDbRebarToConfig`: read `h_inset_in/v_inset_in/grid_inset_in` (fallback `?? 3`) + all 10 `lbar_*` cols (fallbacks via `??` to default values).
- Upsert payload: write all 13 new columns. Keep `*_total_lf: 0` zero-out lines (load-bearing — signals server canonical not yet computed).
- Do NOT touch the post-save reconciliation block (lines 481–502); spread preserves `lbarTotalLf` naturally.

### 4. `src/hooks/useCalculatorState.tsx`
- Inside `migrateLoadedState`, after the rebar→rebarConfigs legacy unwrap and before the draft-discard block:
  - **Pier-pad legacy normalization**: for `type==="pierPad"` areas, move any `rebarConfigs.footing` entry to `rebarConfigs.pier_pad` with `element_type: "pier_pad"`.
  - **Defensive merge**: spread `makeDefaultRebar(et)` then existing config, so pre-Phase-7 localStorage gets new fields backfilled without overwriting user data (prevents `NumberField value={undefined}` crash).
- Imports already present (`makeDefaultRebar`, `RebarConfigsMap`, `RebarElementType`).

## Out of scope (deferred)
- All UI components, settings, QuantitiesPanel, exports — Prompts 7b/7c/7d.
- `shared/calculations/index.ts`, `_shared/calculations.ts` — already v2.3.
- `recalculate-project/index.ts` — L-Bar server branch lands in 7d.
- `src/types/database.ts` — already Phase 5.1-correct.
- All test files (35/35 stay green).
- Existing zero-out lines `h_total_lf: 0` / `v_total_lf: 0` / `grid_total_lf: 0` / new `lbar_total_lf: 0` in upsert.
- Reconciliation block H/V/grid-only writes.
- All non-pierPad cases in `getElementTypes` and `calcTypeToElementType`.

## Verification
1. `npm run build` clean (zero TS errors).
2. `npm test` → 35/35.
3. `RebarConfig` has all 13 new fields; `?` only on `lbarTotalLf`.
4. `makeDefaultRebar(...)` returns inset=3 across H/V/grid/L-Bar; `lbarBendLengthIn=12`; `lbarEnabled=false`.
5. `getElementTypes("pierPad") === ["pier_pad"]`.
6. `calcTypeToElementType("pierPad") === "pier_pad"`; other cases unchanged.
7. Open existing footing+rebar project → Quantities LF unchanged.
8. New footing+H-rebar save → DB row shows `h_inset_in=3, v_inset_in=3, grid_inset_in=3, lbar_enabled=false, lbar_bend_length_in=12, lbar_inset_in=3`.
9. Reload same project → identical Quantities, no console errors.
10. Pre-7a localStorage hydrates without crash; LF matches pre-commit value (defensive merge works).
11. New pier-pad area saves/reloads cleanly; `rebarConfigs` empty `{}`; no rogue writes.

