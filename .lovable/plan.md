

# Fix: Calculator blank state after saving an area

## Problem
After a user saves an area (clicks "Save Area"), the form goes blank. This happens because `DraftActionButtons.tsx` line 22 dispatches `SET_ACTIVE_AREA` with `id: null` after save. The auto-creation effect in `useCalculatorState` then sees that an area already exists for the active tab, so it does not create a new draft. Result: no active area, blank form.

## Expected behavior
After saving an area, the just-saved area should remain selected and visible. The user can then:
- View/edit its measurements
- Use the area selector dropdown to switch between saved areas
- Add a new area via the tab or other UI controls

## Fix

### File: `src/components/calculator/DraftActionButtons.tsx`
**Change**: After a successful save, instead of setting `activeAreaId` to `null`, keep the just-saved area active by removing the `SET_ACTIVE_AREA` dispatch entirely.

```tsx
// Before (line 21-23):
} else {
  toast.success("Area saved");
  dispatch({ type: "SET_ACTIVE_AREA", id: null });
}

// After:
} else {
  toast.success("Area saved");
}
```

This way the `SAVE_AREA` reducer marks `isDraft: false`, the area stays selected, the form remains populated with the saved data, and the `DraftActionButtons` component returns `null` (since `isDraft` is now false) — hiding the Save/Discard buttons naturally.

### No other files need changes
- The `SAVE_AREA` reducer already correctly flips `isDraft` to `false`
- The `AreaSelector` already shows the dropdown for saved areas when one is active
- The form components already render from `activeArea` state
- The auto-draft effect continues to work correctly for empty tabs

