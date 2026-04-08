

# Don't warn on tab-switch for cylinder/steps until user modifies dimensions

## Problem
Cylinder and Steps areas have non-zero defaults that immediately satisfy `hasRequiredData`, so the tab-switch discard warning fires on freshly created, untouched forms.

## Changes — 3 files

### 1. `src/types/calculator.ts` (line ~217)
Add after `isDraft?: boolean;`:
```typescript
/** True once the user has changed at least one dimension on this draft area */
hasUserModifiedDimensions?: boolean;
```

### 2. `src/hooks/useCalculatorState.tsx`
**Part A (~line 391):** In `addArea`, add `hasUserModifiedDimensions: false,` after `isDraft: true,`

**Part B (~line 91):** Replace `UPDATE_AREA` reducer case to set `hasUserModifiedDimensions: true` on first edit of a draft area:
```typescript
case "UPDATE_AREA": {
  const areas = state.areas.map((a) => {
    if (a.id !== action.id) return a;
    const updated = { ...a, ...action.patch };
    if (a.isDraft && !a.hasUserModifiedDimensions) {
      updated.hasUserModifiedDimensions = true;
    }
    return updated;
  });
  return { ...state, areas };
}
```

### 3. `src/components/calculator/CalculatorTabBar.tsx` (line ~46)
Add `&& activeArea.hasUserModifiedDimensions` to the guard:
```typescript
if (activeArea?.isDraft && hasRequiredData(activeArea) && activeArea.hasUserModifiedDimensions) {
```

No other files modified.

