

# Persist Save/Cancel during linear-area building + Cancel confirmation

## Three coordinated edits

**1. `src/hooks/useCalculatorState.tsx` — `ADD_SEGMENT` (lines 143–158)**
Remove the auto-commit branch entirely. New linear areas stay `isDraft: true` through any number of segment additions. Reducer becomes a simple segment append.

**2. `src/hooks/useCalculatorState.tsx` — `saveArea` (lines 506–518)**
Switch from closure `state.areas` to `stateRef.current.areas`. Required because `DraftActionButtons.handleSave` now dispatches `flushPendingSegment()` (an `ADD_SEGMENT`) immediately before calling `saveArea` — closure state would be stale and validation would falsely fail.

**3. `src/components/calculator/DraftActionButtons.tsx`**
- Drop the `flushPendingSegment` early-return short-circuit in `handleSave`. Always call `saveArea` after flushing — uniform path now that auto-commit is gone and `saveArea` reads fresh state.
- Add a second `ConfirmDialog` for Cancel-with-data on new areas.
- `handleCancel` branches: editing existing → immediate `CANCEL_EDIT` (snapshot revert, nothing lost); new + has data via `hasRequiredData(activeArea)` → open confirmation; new + empty → immediate `CANCEL_EDIT`.
- Cancel Edit on existing areas (snapshot restore) never confirms — restoring isn't destruction.

## Behavioral contract

| Scenario | Buttons | Cancel behavior |
|---|---|---|
| New linear area, 0 segments | Save Area + Cancel | Discard silently |
| New linear area, ≥1 segment | Save Area + Cancel | Confirmation dialog |
| New section/dimension area, no data | Save Area + Cancel | Discard silently |
| New section/dimension area, has data | Save Area + Cancel | Confirmation dialog |
| Editing committed area (any type) | Save Area + Cancel Edit + Delete Area | Immediate snapshot revert |

## Out of scope (do NOT touch)
- `EDIT_AREA` / `CANCEL_EDIT` / `SAVE_AREA` reducer cases (Prompt 4 logic intact)
- `UPDATE_AREA` / `ADD_SECTION` / `UPDATE_SECTION` (Prompt 3 state preserved)
- `resolveOutgoingDraft`, `useProject.tsx` save-boundary filter, `migrateAnonData.ts`
- `tfc_anon_has_data` flagging in dispatch wrapper
- `flushPendingSegment` plumbing in `FootingForm` / `LinearForm` / `CurbGutterForm` / `SegmentEntry`
- `src/types/calculator.ts` (`hasRequiredData` already exported)
- Dead `consumeAuthIntent` import in `CalculatorLayout.tsx:3`

## Verification (per prompt's 14-item list)
1. Footing new area: buttons persist across multiple segment adds.
2. Save Area commits new linear area + provisions fresh draft.
3. Save Area with typed-but-not-Added pending segment → flushes + commits, no false "missing fields" toast (validates `stateRef` fix).
4. Cancel on empty new area → silent discard.
5. Cancel on new area with data → confirmation dialog with Discard Area / dismissable.
6. Cancel Edit during edit session (with snapshot) → immediate revert, no dialog.
7. Walls / grade beams / curb & gutter same.
8. Slabs / pier pads — Cancel with section → confirmation.
9. Cylinders / steps — Cancel with dimensions → confirmation; without → silent.
10. Editing slab Cancel Edit → snapshot revert, no dialog.
11. Editing footing → add segment → Save Area commits both, snapshot cleared.
12. Anon header-Save mid-build → persists via Prompt 3 filter.
13. Rapid type → Add → Save sequence never produces stale-state false toast.
14. No test churn.

