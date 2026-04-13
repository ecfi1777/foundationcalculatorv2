

# Phase 2: Add new sections to `/concrete-calculator`

## Single file change: `src/pages/ConcreteCalculator.tsx`

Insert 5 new sections between Section 3 (Real-World Example, ends line 227) and Section 4 (Internal Links, starts line 229). Move Internal Links down. Add Feedback Link at the bottom.

## Final section order

1. Hero + Calculator — no change
2. Differentiator — no change
3. Real-World Example — no change
4. **NEW — Takeoff Software Comparison**
5. **NEW — Mistake Prevention**
6. **NEW — Contractor Insights**
7. **NEW — FAQ (static)**
8. Internal Links — existing, moved down, no content change
9. **NEW — Feedback Link**

## New data arrays (added after `relatedCalculators`)

- `takeoffTools` — 3 items (Bluebeam, PlanSwift, Stack) with `name`, `strength`, `comparison`
- `mistakeItems` — 4 items with `title`, `desc`
- `contractorNotes` — 7 string items
- `faqItems` — 7 items with `q`, `a`

## New JSX sections

### Takeoff Software Comparison
- Background: `bg-muted/40 border-y border-border`
- H2 + short intro paragraph
- 3 cards in `grid-cols-1 md:grid-cols-3`
- Each card: tool name bold, strength text, "This tool:" comparison line

### Mistake Prevention
- H2 + 4 mini-cards in `grid-cols-1 sm:grid-cols-2`
- Example paragraph (garage slab 4"→5", truck short)
- Closing line about auto-updating totals

### Contractor Insights
- Background: `bg-muted/40 border-y border-border`
- H2 + single card with 7 bullet items

### FAQ (static, no state)
- H2 + 7 stacked blocks, question bold, answer below
- All expanded, no accordion

### Feedback Link
- Minimal centered section after Internal Links
- Placeholder URL: `https://forms.example.com/feedback`

## What stays unchanged
- All Phase 1 sections — zero edits
- Calculator embed, JSON-LD, SEO/Helmet
- All imports, providers, state
- No new files, no new dependencies

