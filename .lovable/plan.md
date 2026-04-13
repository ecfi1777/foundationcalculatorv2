

# Enhance `/concrete-slab-calculator` page

## Single file change: `src/pages/ConcreteSlabCalculator.tsx`

Replace the current Example and Link-back sections with 5 new sections, keeping the Hero + Calculator untouched.

---

### Section order after changes

1. Hero + Calculator — **no change**
2. **Formula** — "How to Calculate Concrete for a Slab"
3. **Real-World Example** — multi-section example replacing current single example
4. **Contractor Tips** — 5 bullet points
5. **FAQ** — 7 slab-specific Q&As, all expanded
6. **Internal Links** — 4 related calculators
7. Link back button (moved to bottom)

---

### 1. Formula
- H2: "How to Calculate Concrete for a Slab"
- Card with formula: `Length (ft) × Width (ft) × Thickness (ft) ÷ 27 = cubic yards`
- Two short lines: thickness in inches must be divided by 12; the calculator handles this automatically

### 2. Real-World Example (replaces existing)
- H2: "What a Real Slab Pour Looks Like"
- Single card with 3 line items:
  - Garage Slab: 24′ × 24′ × 5″ → 8.89 yd³
  - Patio: 12′ × 10′ × 4″ → 1.48 yd³
  - Walkway (3 sections): 4′ × 40′ × 4″ → 1.98 yd³
  - Total: 12.35 yd³
- Intro: "Most pours include more than one slab area. The total rolls up across all sections."
- Closing: "Add or remove sections — the total updates automatically."

### 3. Contractor Tips
- H2: "Contractor Tips"
- 5 bullets in a card:
  - Garage slabs are typically 5″–6″ thick; patios and walkways are usually 4″
  - Always add 5–10% for waste — forms aren't perfect and ground isn't level
  - Poor subgrade or soft spots can increase the concrete needed
  - Calculate each slab area separately, then combine for your total order
  - **"Many contractors round up when ordering to avoid coming up short."** *(softened per user feedback)*

### 4. FAQ
- H2: "Concrete Slab Calculator FAQ"
- 7 items, all visible (no accordion):
  - How many yards of concrete for a 24×24 slab?
  - How thick should a concrete slab be?
  - How do I convert square feet to cubic yards?
  - Do I need rebar or wire mesh in a slab?
  - How much extra concrete should I order?
  - What's the difference between a 4-inch and 5-inch slab?
  - Can I pour multiple slab areas in one project?
- Answers: 2-3 sentences each

### 5. Internal Links
- H2: "Related Calculators"
- 2×2 grid of cards:
  - `/concrete-calculator` — "Full concrete calculator for footings, walls, slabs, and more — all in one project."
  - `/concrete-footing-calculator` — "Calculate footing concrete from linear footage and footing dimensions."
  - `/concrete-wall-calculator` — "Calculate wall concrete for foundation and retaining wall sections."
  - `/rebar-calculator` — "Calculate rebar quantities for slabs, footings, and walls."

### 6. Link back button — same as current, moved below Internal Links

---

### Styling
- All sections: `mx-auto max-w-3xl px-4 pb-12`
- Cards use existing `Card` / border+bg-card pattern
- FAQ: bold question, muted answer, stacked with `space-y-2`
- Mobile-friendly (single column, grid collapses)

### What stays unchanged
- Hero, calculator embed, SEO, providers — no change
- No new files, no state, no logic changes

