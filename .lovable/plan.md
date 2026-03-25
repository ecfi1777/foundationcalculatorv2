

# Refactor SegmentEntry: 3-Field Structured Input

## Summary
Replace the single free-text input in `SegmentEntry.tsx` with three separate fields: Feet (numeric), Inches (numeric 0–11), and Fraction (dropdown: 0, 1/4, 1/2, 3/4). This is a single-file change — all linear calculators share this component.

## File: `src/components/calculator/SegmentEntry.tsx`

### State changes
Replace `input`/`editInput` strings with structured state:
- `feetInput`, `inchesInput`: string (for controlled numeric inputs)
- `fractionInput`: string (`"0"`, `"1/4"`, `"1/2"`, `"3/4"`)
- Same pattern for edit state: `editFeet`, `editInches`, `editFraction`

### New input row (add mode)
```text
[ Feet (ft) ] [ Inches (in) ] [ Fraction ▼ ] [ + Add ]
```
- Feet: `<Input type="number" min={0}>`
- Inches: `<Input type="number" min={0} max={11}>`
- Fraction: `<Select>` with options 0, 1/4, 1/2, 3/4
- Add button: disabled when computed `lengthInchesDecimal <= 0`
- Error shown if inches ≥ 12

### Edit mode
Same 3-field layout inline (replacing current single edit input). Pre-populated from `seg.feet`, `seg.inches`, `seg.fraction`.

### Validation logic
- Direct numeric parsing — no regex, no `parseSegmentInputStrict`
- `lengthInchesDecimal = feet * 12 + inches + fractionValue`
- Fraction map: `{ "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 }`

### What stays the same
- `formatSegment()` still used for display labels
- `onAdd`, `onUpdate`, `onDelete` signatures unchanged
- `Segment` type unchanged (feet, inches, fraction, lengthInchesDecimal are already the fields)
- All downstream calculations unaffected
- Saved/loaded segments continue to work (fraction values like `"1/8"` from old data will still display correctly via `formatSegment`)

### Removed
- Import of `parseSegmentInputStrict`
- Old `ERROR_MESSAGES` map
- Old placeholder text with `'` and `"` symbols

### Responsive
- Flex-wrap on the input row so Add button wraps on narrow screens
- Inputs use `flex-1` with min-width to stay usable on mobile

