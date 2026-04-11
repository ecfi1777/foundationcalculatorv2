

# Improve Calculator Workspace Layout & Cohesion

## Summary
Refine the desktop calculator layout in `CalculatorLayout.tsx` and the page wrapper in `ConcreteCalculator.tsx` to eliminate dead vertical space, make the two panels feel like one unified workspace, and anchor the draft action buttons to the form card.

## Changes

### 1. `src/pages/ConcreteCalculator.tsx` — Remove forced `h-screen` wrapper (line 90)

Replace:
```tsx
<div className="h-screen">
```
With:
```tsx
<div className="min-h-[70vh]">
```
This lets the calculator size naturally to content while still claiming meaningful vertical space. No more dead whitespace below the quantities panel.

### 2. `src/components/calculator/CalculatorLayout.tsx` — Desktop section (lines 396–426)

**a) Replace `h-screen` with `min-h-[75vh]`** on the outer flex wrapper (line 397) so the calculator fills space without forcing a full viewport when content is shorter.

**b) Move `DraftActionButtons` inside the form card** (lines 411–418). Currently the buttons sit in a separate `px-4 pb-3` div below the scrollable area, making them feel detached. Move them inside the card alongside `<ActiveForm />`:

```tsx
<div className="flex-1 overflow-y-auto px-4 py-4">
  <div className="rounded-lg border border-border bg-card p-5">
    <ActiveForm />
    <DraftActionButtons />
  </div>
</div>
```
Remove the old standalone `<div className="px-4 pb-3"><DraftActionButtons /></div>`.

**c) Increase form card padding** from `p-4` to `p-5` for more breathing room in the form inputs.

**d) Add matching border/background to quantities panel** (line 420) so both sides feel framed:
```tsx
<div className="w-[400px] flex flex-col overflow-hidden border-l border-border bg-card">
```
Remove the `border-r` from the left column (line 407) since the right panel now has its own `border-l`, avoiding a doubled border.

**e) Add top padding to the tab bar row** — change `pt-3` to `pt-4` (line 410) for consistent spacing.

### Files modified
- `src/pages/ConcreteCalculator.tsx` — 1 line change
- `src/components/calculator/CalculatorLayout.tsx` — ~6 lines changed in the desktop return block

### What stays unchanged
- All calculator logic, state, reducers
- Mobile layout (untouched)
- SEO sections, Field Notes, FAQ
- QuantitiesPanel internals
- DraftActionButtons logic

