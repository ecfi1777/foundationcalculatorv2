

# Plan: Add Inline Area Rename to Quantities Panel

## Summary
Wire the existing `RENAME_AREA` reducer action to the pencil icon in `QuantitiesPanel.tsx` via an inline edit flow. Only `QuantitiesPanel.tsx` is modified.

## Changes — `src/components/calculator/QuantitiesPanel.tsx`

1. **Imports**: Add `useState` to the React import; add `Check, X` from `lucide-react`; add `Input` from `@/components/ui/input`

2. **Local state** (inside `QuantitiesPanel`):
   - `renamingAreaId: string | null` — tracks which area is being renamed
   - `renameValue: string` — current input value

3. **Area header row** (lines 371–391): When `renamingAreaId === r.areaId`, replace the area name `<span>` with:
   - A compact `<Input>` pre-filled with the current name, `autoFocus`, handling `Enter` (confirm) and `Escape` (cancel), `onBlur` cancels
   - A `Check` button and `X` button using `onMouseDown` with `preventDefault()` so blur doesn't fire first
   - Confirm: trim value, dispatch `RENAME_AREA` if non-empty, clear state
   - Cancel: clear state, no dispatch

4. **Pencil icon click**: Change from dispatching `SET_ACTIVE_AREA` to setting `renamingAreaId` and `renameValue`

No other files are modified. The `RENAME_AREA` action in `useCalculatorState.tsx` is already implemented and untouched.

