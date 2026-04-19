

# Revert reducer auto-commits; move logic to save boundary

## Two edits

**1. `src/hooks/useCalculatorState.tsx`** — Revert Prompt 2's three auto-commit branches back to their pre-Prompt-2 form:
- `UPDATE_AREA` (lines 91–106) → drop the `getMissingFields` auto-commit, keep `hasUserModifiedDimensions` flag.
- `ADD_SECTION` (lines 156–168) → simple section append, no commit logic.
- `UPDATE_SECTION` (lines 169–186) → simple section patch, no commit logic.

This restores Save Area / Delete Area button visibility throughout streaming input on slabs, pier pads, cylinders, and steps.

**2. `src/hooks/useProject.tsx`** — Move the auto-commit to the save boundary:
- Add `getMissingFields` to the existing `@/types/calculator` import.
- Replace the `state.areas.filter((a) => !a.isDraft)` filter at line 336 with `(a) => !a.isDraft || getMissingFields(a).length === 0` so valid drafts persist on header Save without flipping `isDraft` in client state.

Exact replacement code is in the user's prompt and will be applied verbatim.

## Out of scope (do NOT touch)
- `ADD_SEGMENT` auto-commit (correct for discrete-click flows: footings/walls/grade beams/curbs)
- `SAVE_AREA` (explicit-commit path used by `DraftActionButtons`)
- `getMissingFields` definition in `src/types/calculator.ts`
- All UI components (`DraftActionButtons`, `QuantitiesPanel`, `CalculatorLayout`) — current `isDraft` reads will work correctly post-revert
- `migrateAnonData.ts` line 105 filter (separate tracked concern)
- Prompt 1 work (`Auth.tsx`, `AppCalculator.tsx`, `authIntent.ts`, `workspaceHandoff.ts`)
- Dead `consumeAuthIntent` import in `CalculatorLayout.tsx:3` (separate cleanup)

## Behavioral contract after this prompt
- `ADD_SEGMENT` (discrete click) → auto-commits on first valid segment.
- `UPDATE_AREA` / `ADD_SECTION` / `UPDATE_SECTION` (streaming input) → NEVER auto-commits.
- `saveProject` → persists committed areas + valid drafts; skips invalid drafts.
- `DraftActionButtons` → visible while `activeArea.isDraft === true`.

## Verification (per prompt)
1. Slab with length+width → Save Area / Delete Area buttons remain visible; area still draft.
2. Same on pier pad, cylinder, steps.
3. Click Save Area on valid slab → commits, toast, active area clears.
4. Anon header Save on valid slab draft → signup → returns with slab persisted in DB.
5. Same with explicit Save Area before header Save.
6. Anon header Save on invalid cylinder (diameter only) → no area persisted.
7. Footing regression unchanged (`ADD_SEGMENT` still auto-commits).
8. Logged-in user adds slab + header Save → upserts cleanly.
9. No test churn expected (no reducer tests in suite).

