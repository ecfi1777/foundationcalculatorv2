

# Clear form after saving an area

## What changes
After a successful save, set the active area to `null` so the form clears. The auto-draft initialization effect will **not** create a new draft automatically (since saved areas already exist for that tab), leaving the user with a clean dropdown to select existing areas or add a new one.

## File: `src/components/calculator/DraftActionButtons.tsx`

In `handleSave`, after `toast.success("Area saved")`, add back the dispatch to clear the active area:

```tsx
} else {
  toast.success("Area saved");
  dispatch({ type: "SET_ACTIVE_AREA", id: null });
}
```

This was the original line we removed in the previous fix. The difference now is that the **auto-draft creation guard** in `useCalculatorState` won't re-create a blank draft because saved areas already exist for the active tab — so it won't loop back to a blank form with a draft. The user will see the area selector dropdown with their saved areas listed, and can pick one to view or click "+ Add Area" to start a new one.

## Verification needed
- The auto-draft effect in `useCalculatorState` must check `hasAreaForActiveTab` before creating a new draft. If it does, setting `activeAreaId` to `null` will simply show the area selector without the form — which is the clean state the user expects.

