

# Fix: Remove auto-draft after Save Area

## Problem
Line 23 in `DraftActionButtons.tsx` calls `addArea(activeArea.type)` immediately after a successful save, auto-creating a new draft area. This causes the "double save" / "why is there another area?" confusion.

## Change

**File: `src/components/calculator/DraftActionButtons.tsx`**

Replace the success branch (lines 20-24) so it:
1. Shows the success toast (preserved)
2. Sets active area to `null` via `dispatch({ type: "SET_ACTIVE_AREA", id: null })`
3. Does **not** call `addArea()`

```tsx
const handleSave = () => {
  const result = saveArea(activeArea.id);
  if (!result.valid) {
    toast.error(`Missing required fields: ${result.missingFields.join(", ")}`);
  } else {
    toast.success("Area saved");
    dispatch({ type: "SET_ACTIVE_AREA", id: null });
  }
};
```

Also remove `addArea` from the destructured context on line 11 (cleanup).

## Post-save behavior
- Area is committed once — no duplication
- Active area becomes `null` — user sees the area selector / empty calculator state
- No new draft is created automatically
- User must explicitly click "+ Add Area" or select an existing area
- Validation, toast, discard flow all unchanged

## Files changed
1. `src/components/calculator/DraftActionButtons.tsx` — remove `addArea` call, set active area to null after save

