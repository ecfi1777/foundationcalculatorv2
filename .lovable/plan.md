

# Auto-commit draft area on first valid segment add

## Problem
Adding a segment keeps the area in `isDraft: true`, requiring a separate "Save Area" click before it appears in quantities.

## Changes — `src/hooks/useCalculatorState.tsx`

**Change 1 (~line 100):** Update `ADD_SEGMENT` reducer case to auto-commit draft areas when the new segment makes them valid via `getMissingFields`.

**Change 2 (~line 297):** Update the dispatch wrapper's anon-data flag to treat `ADD_SEGMENT` the same as `SAVE_AREA` (always set `tfc_anon_has_data`), since `ADD_SEGMENT` may now auto-commit and stateRef would still show the old draft state.

No other files modified. No new imports needed (`getMissingFields` already imported).

