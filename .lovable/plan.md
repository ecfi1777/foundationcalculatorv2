

# Phase 1: `/concrete-calculator` Page Rebuild

## Current State
The page already has intro, comparison table, real-job example, field notes, FAQ, and minimal internal links. Phase 1 replaces all SEO content sections with the 4 specified sections only (removing field notes and FAQ).

## Changes — Single File Only

**`src/pages/ConcreteCalculator.tsx`** — full rewrite of the page content sections.

### Section 1: Hero + Calculator
- Make the H1 visible (remove `sr-only`), text: "Concrete Calculator"
- Short subheadline: contractor-focused, one line about multi-area takeoffs for real foundation work
- One supporting line with key capabilities (feet/inches/fractions, multi-area, footings+walls+slabs)
- Keep the existing calculator embed exactly as-is (CalculatorProvider, ProjectProvider, CalculatorLayout with expand toggle)
- On mobile, minimize text above calculator so it stays near top

### Section 2: Differentiator
- H2: "Why this is different from a typical concrete calculator"
- Replace current table with a responsive approach: table on desktop, stacked comparison cards on mobile
- Six comparison rows per spec (one area vs multiple, one-off vs project workflow, generic vs foundation workflow, harder to revise vs area-by-area updates, no saved structure vs organized sections, basic input vs feet/inches/fractions-friendly)
- Tight copy, no exaggeration

### Section 3: Real-World Basement Example
- H2: "What a real foundation takeoff looks like"
- Grid/card layout showing 5 example areas: Basement Footing, Foundation Wall, Garage Slab, Porch Slab, Stoop / Areaway
- Each card: area name, short dimension hint, calculator type badge
- Short text explaining real jobs = multiple areas, this tool keeps them together
- No screenshots or fake UI

### Section 4: Internal Links
- H2: "More Concrete Calculators"
- 4 link cards in a responsive grid: slab, footing, wall, rebar
- Each card: title, short helper text, link
- Simple, crawlable `<Link>` elements
- Include `/rebar-calculator` (not in current version)

### Removed from current page (not in Phase 1)
- "Field Notes from 20 Years" section
- FAQ section
- These will come in later phases

### What stays unchanged
- JSON-LD scripts (kept as-is)
- SEO/Helmet meta (kept as-is)
- Calculator embed block (CalculatorProvider/ProjectProvider/CalculatorLayout — untouched)
- `isExpanded` state and expand toggle behavior
- All calculator logic/state/hooks/routing files

### Layout & Responsive
- Mobile-first: hero text minimal, calculator near top
- Comparison section: uses `hidden md:block` table + `md:hidden` stacked cards
- Example cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Link cards: `grid-cols-1 sm:grid-cols-2`

### Files changed
- `src/pages/ConcreteCalculator.tsx` — only file modified

### Files NOT changed
- No calculator hooks/state files
- No reducer/persistence files  
- No routing files
- No calculation logic files

