

# Align Calculator Panels & Widen SEO Content

## Changes

### 1. `src/components/calculator/CalculatorLayout.tsx` — Panel alignment (desktop block, lines 405–420)

Make both panels fill the workspace height equally:

- On `<main>` (line 405): keep `min-h-[500px]`, ensure it has a defined height context
- Left column (line 407): add `h-full` — becomes `flex-1 flex flex-col h-full overflow-hidden rounded-l-lg`
- Form scroll area (line 411): add `flex-1` back but only for height-filling within the left column — becomes `flex-1 overflow-y-auto px-4 py-4`
- Form card (line 412): add `flex flex-col h-full` — becomes `rounded-lg border border-border bg-card p-5 flex flex-col h-full`
- Keep `ActiveForm` content at top with no artificial spacing; `DraftActionButtons` stays after it via `mt-auto` so it pushes to the bottom of the card when there's extra space
- Right panel (line 418): already `flex flex-col`, just add `h-full` — no other changes needed

This ensures both columns stretch to the same height defined by the `<main>` container, and the form card fills its column cleanly.

### 2. `src/pages/ConcreteCalculator.tsx` — Widen SEO content (line 101)

Change `max-w-3xl` to `max-w-5xl`:
```tsx
<div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
```

This widens the SEO content from 48rem to 64rem, bringing it closer to the calculator's 80rem container width while keeping readable line lengths.

### Files modified
- `src/components/calculator/CalculatorLayout.tsx` — panel height alignment
- `src/pages/ConcreteCalculator.tsx` — 1 class change on line 101

### Unchanged
- All calculator logic, state, content copy, mobile layout

