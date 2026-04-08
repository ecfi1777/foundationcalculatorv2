

# Flush pending segment input when Save Area is clicked

## Problem
After auto-commit was added, if a user types measurements in the segment input fields but clicks "Save Area" instead of "Add", the pending input is lost — it only exists in SegmentEntry's local React state. This causes a false "Missing required fields" error.

## Changes — 6 files

### 1. `src/hooks/useCalculatorState.tsx`
- Add `registerSegmentFlush` and `flushPendingSegment` to the `CalcCtx` interface (after `flushBeforeSave`)
- Add `segmentFlushRef`, `registerSegmentFlush` callback, and `flushPendingSegment` callback in `CalculatorProvider` (after `flushBeforeSave` declaration, ~line 289)
- Add both to the context Provider value object (line 425)

### 2. `src/components/calculator/SegmentEntry.tsx`
- Change React import to include `forwardRef` and `useImperativeHandle`
- Export new `SegmentEntryHandle` interface with `flushPending: () => boolean`
- Convert `SegmentEntry` from named function to `forwardRef<SegmentEntryHandle, SegmentEntryProps>`
- Add `useImperativeHandle` exposing `flushPending()` that validates inputs, calls `handleAdd()` if valid, returns `true`/`false`

### 3. `src/components/calculator/FootingForm.tsx`
- Add `useRef` to React import; add `SegmentEntryHandle` to SegmentEntry import
- Declare `segmentEntryRef = useRef<SegmentEntryHandle>(null)`
- Destructure `registerSegmentFlush` from `useCalculatorState()`
- Add `useEffect` to register/unregister the segment flush callback (keyed on `area?.id`)
- Pass `ref={segmentEntryRef}` to `<SegmentEntry>`

### 4. `src/components/calculator/LinearForm.tsx`
- Same four additions as FootingForm

### 5. `src/components/calculator/CurbGutterForm.tsx`
- Same four additions as FootingForm

### 6. `src/components/calculator/DraftActionButtons.tsx`
- Destructure `flushPendingSegment` from `useCalculatorState()`
- Update `handleSave`: call `flushPendingSegment()` after `flushBeforeSave()`. If it returns `true`, skip `saveArea()` (auto-commit already handled it in the reducer) and just show success toast + deactivate area. Only call `saveArea()` when no segment was flushed.

