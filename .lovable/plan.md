

# Auto-commit drafts in section/dimension calculators

## Three edits in `src/hooks/useCalculatorState.tsx`

Mirror the existing `ADD_SEGMENT` auto-commit pattern (lines 107–118) so slabs, pier pads, cylinders, and steps flip `isDraft: false` the moment they become valid via `getMissingFields(updated).length === 0`.

1. **`UPDATE_AREA`** (lines 91–101) — covers cylinders & steps (dimension-driven).
2. **`ADD_SECTION`** (lines 151–156) — covers slabs & pier pads when the first valid section is added.
3. **`UPDATE_SECTION`** (lines 157–169) — covers slabs & pier pads when editing an existing section to validity.

All three use the exact replacement code provided in the prompt.

## Out of scope (do NOT touch)
- `ADD_SEGMENT` (reference pattern), `SAVE_AREA`, `DELETE_SEGMENT` in the same reducer
- `getMissingFields` in `src/types/calculator.ts`
- `saveProject` `isDraft` filter in `src/hooks/useProject.tsx:336`
- `migrateAnonData.ts`, dead `consumeAuthIntent` import in `CalculatorLayout.tsx:3`
- All UI components (`QuantitiesPanel`, `CalculatorLayout`, `AreaSelector`, `CalculatorTabBar`, `DraftActionButtons`) — their current `isDraft` reads work correctly with the new behavior

## Tests
Will check `src/lib/calculations/__tests__/` and any reducer tests before editing. If a test encoded the bug as expectation (e.g., asserts `isDraft: true` after a valid `UPDATE_AREA`), I'll flag it in the implementation summary and update it to expect the corrected behavior — not silently rewrite.

## Verification (per prompt)
1. Slab anon-save → auth → return → persists (primary bug).
2. Pier pad — same.
3. Cylinder — same.
4. Steps — same.
5. Footing regression — unchanged.
6. Partial cylinder (diameter only) stays draft, not saved.
7. Slab section flipped to validity via `UPDATE_SECTION` saves.
8. Logged-in user adds slab to existing project — upserts cleanly.
9. No test churn unless a test encoded the bug; flagged if so.

