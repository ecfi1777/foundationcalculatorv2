

# Phase 5.1 — Rebar schema migration + server canonical wiring (v2.3)

## Scope: 4 changes, no UI

### 1. New Supabase migration
Create migration in `supabase/migrations/` adding:
- `user_settings.rebar_inset_in DECIMAL NOT NULL DEFAULT 3`
- `rebar_configs.h_inset_in / v_inset_in / grid_inset_in` — all `DECIMAL NOT NULL DEFAULT 3`
- Full L-Bar column group on `rebar_configs` (10 cols): `lbar_enabled` (NOT NULL DEFAULT FALSE), `lbar_bend_length_in` (NOT NULL DEFAULT 12), `lbar_waste_pct` and `lbar_total_lf` (NOT NULL DEFAULT 0), the rest nullable per spec §12.1
- Drop + re-add `rebar_configs_element_type_check` to include `'pier_pad'`

Zero rows in `rebar_configs` today, so no backfill concern.

### 2. `src/types/database.ts`
- Add `h_inset_in`, `v_inset_in`, `grid_inset_in` (number) to `RebarConfig` after each respective `*_waste_pct`
- Add full L-Bar block to `RebarConfig` before `created_at` (nullables typed `| null` per spec)
- Add `rebar_inset_in: number` to `UserSettings` after `rebar_overlap_in`

### 3. `src/types/calculator.ts`
- Extend `RebarElementType` union with `"pier_pad"`

### 4. `supabase/functions/recalculate-project/index.ts`
- Pass `insetIn: Number(rc.h_inset_in)` to `calcRebarHorizontal` (clean line — corrected per user's self-correction; no bogus duplicate `wastePct`)
- Pass `insetIn: Number(rc.grid_inset_in)` to `calcRebarSlabGrid`
- Do NOT touch `calcRebarVertical` call (v2.3 §8.10: vertical ignores inset; column stored for forward compat)
- Do NOT add an L-Bar compute branch (Phase 7)

Direct `Number(rc.*_inset_in)` — no `|| 3` fallback — because columns are NOT NULL DEFAULT 3 and an explicit `0` is a valid user choice that must be preserved.

## Out of scope (deferred to Phase 7+)
- All calculator form UI, settings UI, Quantities panel, exports, How-It-Works page
- `shared/calculations/index.ts` and `supabase/functions/_shared/calculations.ts` (already v2.3 from Phase 5)
- All test files (rebar.test.ts already at 35/35)
- L-Bar wiring in recalculate-project
- Vertical inset wiring

## Verification
1. New migration file present with all 4 statement blocks.
2. `information_schema.columns` query confirms `h/v/grid_inset_in` NOT NULL DEFAULT 3 + all 10 `lbar_*` cols.
3. `user_settings.rebar_inset_in` NOT NULL DEFAULT 3.
4. `pg_get_constraintdef` for `rebar_configs_element_type_check` includes `'pier_pad'`.
5. `RebarConfig` and `UserSettings` types updated exactly as specified.
6. `RebarElementType` includes `'pier_pad'`.
7. recalculate-project passes `insetIn` to H + grid only; no L-Bar branch added; vertical untouched.
8. `npm test` still 35/35.
9. Existing projects load cleanly.

