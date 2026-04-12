

# Update Area Action Labels and Confirmation

## Changes: `src/components/calculator/DraftActionButtons.tsx`

1. **Keep "Save Area"** — no label change on the positive button
2. **Rename "Discard Area" → "Delete Area"** on the destructive button (line ~57)
3. **Always confirm before deletion** — remove the `hasRequiredData` conditional; always open the confirm dialog when Delete Area is clicked
4. **Update confirmation dialog copy:**
   - Title: "Delete Area"
   - Description: `Are you sure you want to delete "${activeArea.name}"? All measurements will be permanently removed.`
   - Confirm label: "Delete"

### Files modified
- `src/components/calculator/DraftActionButtons.tsx`

### Unchanged
- CalculatorLayout.tsx, QuantitiesPanel, calculation logic, state management, mobile layout

