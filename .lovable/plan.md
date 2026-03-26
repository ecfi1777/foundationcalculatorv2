

# Live Default Segment — Implementation

## Summary
Make the first segment input row "live" so calculations update immediately as the user types, without requiring "+ Add". The pending value is tracked transiently on each area and included in all calculation outputs.

## Changes

### 1. `src/types/calculator.ts`
- Add `pendingSegmentLengthIn?: number` to `CalcArea` interface
- Update `getMissingFields` for linear types: also treat an area as valid if `pendingSegmentLengthIn > 0` (so the user can save with just the live segment)

### 2. `src/components/calculator/SegmentEntry.tsx`
- Add `onPendingChange?: (lengthInchesDecimal: number) => void` prop
- Add a `useEffect` watching `feetInput`, `inchesInput`, `fractionInput` that calls `onPendingChange(computeLength(...))` on every change
- Update the "Total" display (line 136/240) to accept and include an optional `pendingLengthIn` prop — show the total row whenever segments exist OR pending > 0
- No changes to `handleAdd` — after it clears inputs, the `useEffect` naturally fires `onPendingChange(0)`, preventing double-counting

### 3. `src/lib/computeArea.ts` (line 102)
Include pending segment in total:
```ts
const pendingIn = area.pendingSegmentLengthIn ?? 0;
const totalLinearFt = (area.segments.reduce((s, seg) => s + seg.lengthInchesDecimal, 0) + pendingIn) / 12;
```
This flows through all downstream calcs (concrete volume, rebar, etc.) automatically.

### 4. `src/components/calculator/FootingForm.tsx`
Wire `onPendingChange` on `SegmentEntry`:
```tsx
onPendingChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { pendingSegmentLengthIn: v } })}
```

### 5. `src/components/calculator/LinearForm.tsx`
Same `onPendingChange` wiring.

### 6. `src/components/calculator/CurbGutterForm.tsx`
Same `onPendingChange` wiring.

### 7. `src/hooks/useCalculatorState.tsx`
- In `SAVE_AREA` reducer: clear `pendingSegmentLengthIn` to 0 on the saved area
- In `SET_ACTIVE_AREA` reducer: clear `pendingSegmentLengthIn` to 0 on the area being left (prevents stale values)
- In `SET_TAB` reducer: same cleanup on the area being left

### 8. `src/components/calculator/QuantitiesPanel.tsx`
- Change the filter (line 54-56) to include draft areas that have meaningful data: either stored segments/sections, or `pendingSegmentLengthIn > 0`, or valid dimensions (cylinder/steps)
- This ensures the active draft with a live pending segment shows up in quantities in real-time

## Double-counting prevention
When "+ Add" is clicked:
1. Segment is committed to stored segments array
2. Input fields clear (setState to "")
3. `useEffect` fires → `onPendingChange(0)` → `pendingSegmentLengthIn` becomes 0
4. Value moves from pending → stored atomically — no frame where both are counted

## Area/tab switching cleanup
- Reducer clears `pendingSegmentLengthIn` when switching away
- `SegmentEntry` unmounts/remounts with fresh local state for new area (React component lifecycle)

## No changes to
- DB schema or persistence (pending is transient, stripped on load via `migrateLoadedState` defaulting)
- Export logic (exports only use committed saved areas)
- Existing segment CRUD behavior
- UI layout or design language

