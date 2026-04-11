

# Improve Calculator Workspace Layout & Cohesion

## Summary
Tighten the desktop calculator workspace by removing forced vertical stretching, repositioning action buttons closer to inputs, and improving panel balance. Save button stays primary.

## Changes

### 1. `src/components/calculator/CalculatorLayout.tsx` (desktop block)
- Remove `min-h-[75vh]` from outer wrapper (or set `min-h-0`)
- Add `min-h-[500px]` to the `<main>` flex container
- Stop flex-stretching the form area — remove `flex-1` from the form scroll container so the card sizes to content
- Add `rounded-l-lg` to left column, `rounded-r-lg` to right panel for unified framing

### 2. `src/components/calculator/DraftActionButtons.tsx`
- Change `pt-2` to `mt-4` for tighter spacing below inputs
- Add `h-9 text-sm` to both buttons for slightly smaller size
- **Keep Save as `default` variant** (primary green) — no change to variant
- Keep Discard as outline/destructive — no change

### 3. `src/components/calculator/SegmentEntry.tsx`
- Increase gap between feet/inches/fraction inputs to better use available width

### Files modified
- `src/components/calculator/CalculatorLayout.tsx`
- `src/components/calculator/DraftActionButtons.tsx`
- `src/components/calculator/SegmentEntry.tsx`

### Unchanged
- All calculator logic, state, reducers
- Mobile layout
- SEO content sections
- Save button variant (stays primary)

