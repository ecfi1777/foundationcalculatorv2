

# Add EDIT_AREA Compound Action

## Changes

### 1. `src/hooks/useCalculatorState.tsx`

**Add to Action union (line 37):**
```typescript
| { type: "EDIT_AREA"; tab: CalculatorType; id: string }
```

**Add reducer case after SET_ACTIVE_AREA (after line 74):**
```typescript
case "EDIT_AREA": {
  const areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
  return { ...state, areas, activeTab: action.tab, activeAreaId: action.id };
}
```

### 2. `src/components/calculator/QuantitiesPanel.tsx`

**Replace lines 121-122:**
```typescript
// Before:
dispatch({ type: "SET_TAB", tab: r.type });
dispatch({ type: "SET_ACTIVE_AREA", id: r.areaId });

// After:
dispatch({ type: "EDIT_AREA", tab: r.type, id: r.areaId });
```

No other files change. No calculation, persistence, or UI behavior changes.

