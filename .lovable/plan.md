

# Add edit-session snapshots and Cancel Edit flow

## Four coordinated edits

**1. `src/types/calculator.ts`** — Add optional `preEditSnapshot?: Omit<CalcArea, "preEditSnapshot">` field to `CalcArea`. Presence of this field signals an edit session of a previously-committed area.

**2. `src/hooks/useCalculatorState.tsx`** — Reducer changes:
- Add `CANCEL_EDIT` to the action union and `DATA_ACTIONS` set.
- `EDIT_AREA`: stash a snapshot (omitting its own field) and flip `isDraft: true`. Guard against overwriting an existing snapshot.
- `SAVE_AREA`: clear `preEditSnapshot` when committing.
- New `CANCEL_EDIT` case: if snapshot exists, restore it (committed); if not, discard the area entirely (new draft).
- localStorage persist effect: strip snapshots and commit in-progress edits (`isDraft: false`) so refreshes don't restore stale edit sessions.

**3. `src/components/calculator/DraftActionButtons.tsx`** — Three-button layout:
- New area (no snapshot): Save Area + Cancel Edit.
- Editing committed area (has snapshot): Save Area + Cancel Edit + Delete Area.
- Cancel calls `flushBeforeSave()` then dispatches `CANCEL_EDIT`.

**4.** All replacement code in the user's prompt is applied verbatim.

## Out of scope (do NOT touch)
- `ADD_SEGMENT` auto-commit (footing discrete-click flow unchanged)
- `UPDATE_AREA` / `ADD_SECTION` / `UPDATE_SECTION` (Prompt 3 state preserved)
- `DELETE_AREA`, `resolveOutgoingDraft`, `getMissingFields`
- `saveProject` save-boundary filter from Prompt 3
- `QuantitiesPanel.tsx` and `CalculatorLayout.tsx:93` edit dispatches
- `migrateAnonData.ts`, `migrateLoadedState`
- Dead `consumeAuthIntent` import in `CalculatorLayout.tsx:3`

## Behavioral contract after this prompt
- New area → Save Area + Cancel Edit (no Delete).
- Editing committed area (pencil click) → Save Area + Cancel Edit + Delete Area; `isDraft: true` for live preview; snapshot held.
- Cancel Edit on new draft → area discarded.
- Cancel Edit on edit session → restored from snapshot, committed.
- Save Area → snapshot cleared, area committed.
- Refresh mid-edit → in-progress edits persist as committed; snapshot dropped.

## Verification (per prompt's 13-item list)
1–7: Slab new vs edit-existing flows for all three buttons, including Cancel revert and Save re-commit.
8–9: Footing pre-segment new-area flow + post-segment auto-commit regression + pencil re-edit.
10: Anon header Save on valid-draft slab (with snapshot) → still persists via Prompt 3's filter.
11: Refresh mid-edit → reloads as committed with edits applied, no snapshot.
12: Tab-switch during edit session preserves snapshot via `resolveOutgoingDraft`.
13: No test churn expected.

