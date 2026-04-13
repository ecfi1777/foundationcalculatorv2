

# Enhance `/rebar-calculator` page

## Single file change: `src/pages/RebarCalculator.tsx`

Replace the placeholder with a full content page matching the footing/slab/wall pattern exactly.

---

### Calculator embed

Use `initialTab="footing"` with `hydrateFromStorage={false}` — footing is the most common rebar use case, and rebar controls (the inline checkbox addon) are immediately visible within the footing form. No logic, routing, or state changes needed.

### SEO

Update title to "Rebar Calculator | Free Rebar Estimator" and description to target rebar-specific queries.

### Section order & content

Follows the exact same JSX structure, class names, and card patterns as the footing page.

1. **H1 + intro** — "Rebar Calculator" with: "Rebar quantities depend on spacing, bar size, overlap, and layout — and they're different for slabs, footings, and walls. Most jobs have multiple sections with different rebar configurations. Enter your dimensions above and the calculator totals the bars, overlap, and footage."

2. **Calculator** — `CalculatorProvider initialTab="footing" hydrateFromStorage={false}` wrapping `ProjectProvider` + `CalculatorLayout`

3. **Formula** — "How to Calculate Rebar" card with 3 bullet-style lines (slab grids / footing+wall runs / overlap) + closing line about the calculator handling layout math

4. **Real-World Example** — "What a Real Rebar Layout Looks Like" card with divide-y rows:
   - Garage Slab Grid — #4 @ 12″ O.C. → 1,840 LF
   - Main Footing — 3 continuous #4 bars → 600 LF
   - Foundation Wall Verticals — #4 @ 24″ O.C. → 188 LF
   - Foundation Wall Horizontals — 2 runs #4 → 470 LF
   - Total: 3,098 LF

5. **Contractor Tips** — 6 bullets (spacing impact, continuous bars, wall steel, overlap, waste 5–10%, separate layouts)

6. **FAQ** — 7 expanded items (how to calculate, spacing effect, splice meaning, separate by type, waste, horizontal vs vertical, project totals)

7. **Internal Links** — 2×2 grid linking to `/concrete-calculator`, `/concrete-slab-calculator`, `/concrete-footing-calculator`, `/concrete-wall-calculator`

8. **Link back button** — same pattern as other pages

### Styling

Identical to footing page: `max-w-3xl mx-auto px-4 pb-12`, `rounded-lg border border-border/60 bg-card`, `divide-y`, `space-y-4` for FAQ.

### What stays unchanged

- No new files, components, or dependencies
- No calculator logic, state, routing, or provider changes
- One file modified: `src/pages/RebarCalculator.tsx`

