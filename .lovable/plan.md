

# Apply Blur-Commit Pattern to LinearForm and CurbGutterForm

## Files Changed
1. `src/components/calculator/LinearForm.tsx`
2. `src/components/calculator/CurbGutterForm.tsx`

## Pattern (identical to FootingForm)
Both forms get the same three additions:

1. **Local state**: `localDims` (`Record<string, number>`) and `localWaste` (`number`) via `useState`
2. **Sync effect** on `[area?.id]`: rehydrates local state from area when switching areas
3. **Flush registration** effect on `[area?.id, localDims, localWaste, ...]`: registers a callback that dispatches `UPDATE_AREA` with current local values; cleanup nulls the callback
4. **Blur-commit helpers**: `commitDim(key)` and `commitWaste()` dispatch on blur
5. **NumberField wiring**: `onChange` updates local state only; `onBlur` calls commit

## LinearForm — local fields
- `localDims[dim1Key]` (heightIn or widthIn depending on wall/gradeBeam)
- `localDims[dim2Key]` (thicknessIn or depthIn)
- `localWaste`

Immediate dispatches (unchanged): `SET_ACTIVE_AREA`, `DELETE_AREA`, `RENAME_AREA`, `ADD_SEGMENT`, `UPDATE_SEGMENT`, `DELETE_SEGMENT`, `UPDATE_REBAR`

## CurbGutterForm — local fields
- `localDims.curbDepthIn`
- `localDims.curbHeightIn`
- `localDims.gutterWidthIn`
- `localDims.flagThicknessIn`
- `localWaste`

Immediate dispatches (unchanged): same structural actions as above

## No other files changed
- `NumberField.tsx` already has `onBlur` prop from the FootingForm work
- `useCalculatorState.tsx` already has `registerFlushCallback` / `flushBeforeSave`
- `DraftActionButtons.tsx` already calls `flushBeforeSave()` before save
- The flush registry is a single ref — whichever form is mounted last owns it, which is correct since only one form is active at a time

