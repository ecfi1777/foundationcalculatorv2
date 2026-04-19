

# Disable ADD_SEGMENT auto-commit during edit sessions

## One conditional change

**`src/hooks/useCalculatorState.tsx`** (lines 143–154, the `ADD_SEGMENT` branch):

Add `&& !a.preEditSnapshot` to the auto-commit guard. Snapshot present = active edit session → user controls commit via Save Area. Snapshot absent = first-time linear-area creation → preserve existing auto-commit on first valid segment.

Replacement code applied verbatim from the prompt.

## Out of scope (do NOT touch)
- Every other reducer branch (`EDIT_AREA`, `CANCEL_EDIT`, `SAVE_AREA`, `UPDATE_AREA`, `ADD_SECTION`, `UPDATE_SECTION`, persist-time strip, `resolveOutgoingDraft`)
- `DraftActionButtons.tsx` — existing `!activeArea?.isDraft` gate now correctly keeps buttons visible
- `useProject.tsx` save-boundary filter from Prompt 3
- `src/types/calculator.ts` (`preEditSnapshot` typing already in place)
- Dead `consumeAuthIntent` import in `CalculatorLayout.tsx:3`
- Pre-existing `hasUserModifiedDimensions` gap in `ADD_SEGMENT`

## Behavioral contract after this prompt
- New linear area, first valid segment → auto-commits (unchanged).
- Editing committed linear area, additional segment → stays draft, buttons remain, snapshot intact.
- Cancel Edit during edit-session segment add → reverts the new segment.
- Save Area during edit-session segment add → commits + clears snapshot (re-edit picks up fresh baseline).

## Verification (per prompt's 9-item list)
1. Footing pencil → add segment → buttons stay visible, area still draft.
2. Cancel Edit reverts the newly-added segment.
3. Save Area commits the edit.
4. Re-edit after Save uses fresh snapshot (not stale).
5. New-area first-segment auto-commit regression check.
6. Defensive guard for unexpected snapshot on new area.
7. Walls / grade beams / curb & gutter same behavior.
8. Slabs / pier pads / cylinders / steps unaffected (don't use ADD_SEGMENT).
9. Anon header-save mid-edit still persists via Prompt 3's filter.

