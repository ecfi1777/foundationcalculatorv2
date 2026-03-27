

# Refactor FootingForm: Local State for Dimensions/Waste

## Flush Callback Safety — Confirmed

The flush callback uses a single `useRef` on the context provider. This guarantees safety:

1. **Only the active form owns it**: `registerFlushCallback` accepts one callback. Each form calls `registerFlushCallback(myFlush)` on mount/area-change and `registerFlushCallback(null)` on unmount. Only one callback exists at a time — no array, no stacking.

2. **Reliable replacement/clearing**:
   - **Area switch**: FootingForm unmounts (or `area?.id` changes), cleanup runs `registerFlushCallback(null)`, new form registers its own callback.
   - **Tab/type switch**: FootingForm unmounts entirely, `useEffect` cleanup fires `registerFlushCallback(null)`.
   - **Unmount**: Same cleanup path — React guarantees `useEffect` cleanup runs before the next effect or on unmount.

3. **No stale callbacks**: `flushBeforeSave()` reads `ref.current` at call time. If no form is mounted, `ref.current` is `null` and the call is a no-op. There is no closure capture of an old callback — it's always a direct ref read.

**Concrete implementation in `useCalculatorState.tsx`:**
```tsx
const flushRef = useRef<(() => void) | null>(null);
const registerFlushCallback = useCallback((cb: (() => void) | null) => {
  flushRef.current = cb;
}, []);
const flushBeforeSave = useCallback(() => {
  flushRef.current?.();
}, []);
```

**Concrete implementation in `FootingForm.tsx`:**
```tsx
useEffect(() => {
  const flush = () => {
    // dispatch UPDATE_AREA with current localDims + localWaste
  };
  registerFlushCallback(flush);
  return () => registerFlushCallback(null);
}, [area?.id, localDims, localWaste]);
```

The `localDims` and `localWaste` dependencies ensure the registered closure always captures fresh values. Cleanup nulls the ref before any new registration.

## Scope
- Dimensions and waste only (pending segment already local from prior work)
- Rebar, mode toggle, segment CRUD remain immediate dispatches

## Files changed
1. `src/components/calculator/NumberField.tsx` — add `onBlur` prop
2. `src/components/calculator/FootingForm.tsx` — local state, blur-dispatch, register flush callback
3. `src/hooks/useCalculatorState.tsx` — add `registerFlushCallback` / `flushBeforeSave` to context
4. `src/components/calculator/DraftActionButtons.tsx` — call `flushBeforeSave()` before `saveArea()`

