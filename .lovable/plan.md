

# Fix: Prevent empty "My Project" on login

Two surgical edits.

## 1. `src/hooks/useCalculatorState.tsx` — lines 246-250

Current code sets `tfc_anon_has_data` for **every** `DATA_ACTIONS` action, including `ADD_AREA` and draft edits.

**Replace** the block at lines 246-250 with logic that:
- Skips setting the flag for `ADD_AREA` (only creates an empty draft).
- For `SAVE_AREA`, always sets the flag (user explicitly committed).
- For all other `DATA_ACTIONS`, reads the current reducer state to find the target area (using `activeAreaId` from `state`). If that area is a draft (`isDraft === true`), skip setting the flag. If it's a committed area, set it.

This requires reading `state` inside the dispatch wrapper. Since `baseDispatch` has already fired by the time we check, the state ref won't have updated yet — so we need a `stateRef` that tracks the **pre-dispatch** state. We already have access to `state` from the reducer; we can use a ref that's updated via `useEffect`.

Actually simpler: we can check the **action type** and the **pre-dispatch state** areas directly. Add a `stateRef = useRef(state)` kept in sync, and read `stateRef.current` in the dispatch wrapper.

```typescript
const stateRef = useRef(state);
useEffect(() => { stateRef.current = state; }, [state]);

const dispatch = useCallback((action: Action) => {
  if (action.type === "RESET") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("tfc_anon_has_data");
  }
  baseDispatch(action);
  if (DATA_ACTIONS.has(action.type)) {
    isDirtyRef.current = true;
    setIsDirty(true);

    // Only flag anon data for committed work
    if (action.type === "SAVE_AREA") {
      localStorage.setItem("tfc_anon_has_data", "true");
    } else if (action.type !== "ADD_AREA") {
      const currentState = stateRef.current;
      const targetId = 'areaId' in action ? action.areaId
        : 'id' in action ? action.id
        : currentState.activeAreaId;
      const targetArea = currentState.areas.find(a => a.id === targetId);
      if (targetArea && !targetArea.isDraft) {
        localStorage.setItem("tfc_anon_has_data", "true");
      }
    }
  }
  // ... rest unchanged
}, []);
```

## 2. `src/lib/migrateAnonData.ts` — after line 101

Import `hasRequiredData` from `@/types/calculator`. After parsing state, filter areas:

```typescript
const migratableAreas = state.areas.filter(
  area => area.isDraft !== true && hasRequiredData(area)
);
if (migratableAreas.length === 0) {
  clearAnonData();
  localStorage.removeItem(STORAGE_KEY);
  return;
}
```

Then replace `state.areas` with `migratableAreas` in the `for` loop at line 123:
```typescript
for (const area of migratableAreas) {
```

## No other files change

