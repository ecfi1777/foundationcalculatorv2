

# Explicit "Save Area" for Drafts Only

## Summary

Remove auto-promotion of drafts. Add a `SAVE_AREA` reducer action and a "Save Area" button in `AreaSelector`. When navigating away from an unsaved draft with data, show a discard confirmation. Already-saved (non-draft) areas continue to edit normally with no extra save step.

## Changes

### 1. `src/types/calculator.ts`
- Add `getMissingFields(area: CalcArea): string[]` — returns human-readable names of missing required fields (e.g. `["Length", "Width"]`). Returns `[]` if valid. Used by the save validation and toast messages.

### 2. `src/hooks/useCalculatorState.tsx`

**Remove:**
- Delete `maybePromoteDraft` function entirely (lines 51-57).
- Remove all 6 calls to `maybePromoteDraft` in the reducer (in `UPDATE_AREA`, `ADD_SEGMENT`, `UPDATE_SEGMENT`, `ADD_SECTION`, `UPDATE_SECTION`, `UPDATE_REBAR`). Keep the state mutation, just drop the second `areas = maybePromoteDraft(...)` line.

**Modify `resolveOutgoingDraft`:**
- If draft has no data (`!hasRequiredData`): discard silently (keep current behavior).
- If draft has data: **do not auto-promote, do not discard** — leave it in place. The UI layer handles the confirmation dialog.

**Add:**
- New action type `SAVE_AREA` with `{ type: "SAVE_AREA"; id: string }`.
- Reducer case: find the area, if `isDraft`, set `isDraft: false`. No-op if area isn't a draft.
- Add `"SAVE_AREA"` to `DATA_ACTIONS` set.
- Expose `saveArea(id: string): { valid: boolean; missingFields: string[] }` on context. Calls `getMissingFields`, dispatches `SAVE_AREA` only if valid, returns result.

### 3. `src/components/calculator/AreaSelector.tsx`

**Add "Save Area" button:**
- Visible only when `activeArea?.isDraft === true`.
- On click: calls `saveArea(activeAreaId)`. If invalid, shows toast with missing fields. If valid, area promotes.

**Add discard-unsaved-draft confirmation:**
- When user clicks "Add Area" or selects a different area while current active area is a draft with data (`isDraft && hasRequiredData`):
  - Show a `ConfirmDialog`: "Discard unsaved area?"
  - On confirm: dispatch `DELETE_AREA` for the draft, then proceed with the pending action.
  - On cancel: do nothing.
- If the draft has no data, silently discard (existing `resolveOutgoingDraft` handles this).

**Key rule:** This interception only applies when `activeArea?.isDraft`. Non-draft area switches work exactly as before.

### 4. `src/components/calculator/CalculatorTabBar.tsx` (if tab switching bypasses AreaSelector)
- Same guard: if switching tabs while a draft with data exists, show discard confirmation before proceeding.

### No changes to:
- `QuantitiesPanel.tsx` — already filters drafts
- `useProject.tsx` — already excludes drafts from persistence
- Any calculation logic or formulas

## UX Flow

1. "Add Area" → draft created, form opens, not in Quantities Panel
2. User edits measurements → still a draft, still hidden from Quantities
3. "Save Area" → validates → if valid, `isDraft = false`, appears in Quantities Panel
4. "Save Area" with missing fields → toast: "Missing: Length, Width"
5. Switch area/tab with unsaved draft containing data → "Discard unsaved area?" dialog
6. Switch area/tab with empty draft → silently discarded
7. **Edit an already-saved area → works normally, no Save button shown, changes apply immediately**

