

# Enhance `/concrete-wall-calculator` page

## Single file change: `src/pages/ConcreteWallCalculator.tsx`

Rewrite the page to match the footing/slab page pattern. Keep SEO, H1, and calculator embed. Replace everything below the calculator with 5 new sections.

---

### Section order

1. **H1 + intro** — keep H1, replace intro with: "Wall concrete is calculated from length, height, and thickness. Foundation walls, stem walls, and retaining walls are common — and most jobs include multiple wall sections at different dimensions. Enter your measurements above and the calculator handles the rest."
2. **Calculator** — no change (`initialTab="wall"`, `hydrateFromStorage={false}`)
3. **Formula** — "How to Calculate Concrete for Walls"
4. **Real-World Example** — "What a Real Wall Layout Looks Like"
5. **Contractor Tips** — 6 bullets
6. **FAQ** — 7 items, all expanded
7. **Internal Links** — 2×2 grid
8. **Link back button**

---

### Content

**Formula card:**
`Length (ft) × Height (ft) × Thickness (ft) ÷ 27 = cubic yards`
"Thickness is usually measured in inches — divide by 12 to convert to feet. The calculator handles this automatically."

**Example card (3 items, divide-y):**
- Foundation Walls: 235 LF × 8′ × 8″ → 46.42 yd³
- Garage Stem Wall: 120 LF × 4′ × 8″ → 11.85 yd³
- Retaining Wall Section: 60 LF × 3′ × 10″ → 5.56 yd³
- Total: 63.83 yd³
- Intro: "Most projects include multiple wall sections with different heights and thicknesses."
- Closing: "Adjust any section and the total updates automatically."

**Contractor Tips (6 bullets):**
- Wall thickness varies depending on structure type and engineering requirements
- Basement foundation walls are typically 8″ thick for residential construction
- Retaining walls may require 10″–12″ or thicker depending on height and soil pressure
- Height changes have a large impact on volume — even a small increase adds significant yardage
- Deduct for window and door openings where possible to avoid over-ordering
- Always add 5–10% for waste — forms shift, and walls are rarely perfectly uniform

**FAQ (7 items, expanded):**
1. How many yards of concrete per linear foot of wall? → Depends on height and thickness. An 8′ tall × 8″ thick wall uses about 0.20 yd³ per linear foot.
2. What is a typical foundation wall thickness? → Most residential foundation walls are 8″ thick. Taller walls or heavy loads may require 10″ or more.
3. How do I calculate concrete for a wall? → Multiply length × height × thickness (all in feet), then divide by 27. Convert inches to feet first.
4. Should I subtract for window and door openings? → Yes, if the openings are significant. Small openings may not be worth deducting — the extra concrete covers waste.
5. How much extra concrete should I order? → Plan for 5–10% extra. Wall forms can shift slightly, and concrete settles into uneven spots.
6. What's the difference between a stem wall and a foundation wall? → A stem wall is the shorter wall between the footing and the slab or floor. A foundation wall runs the full height from footing to top of wall.
7. Do concrete walls need rebar? → Yes. Most poured walls require both horizontal and vertical rebar per code. Spacing depends on wall height and local requirements.

**Internal Links (2×2 grid):**
- `/concrete-calculator` — "Full concrete calculator for footings, walls, slabs, and more — all in one project."
- `/concrete-slab-calculator` — "Calculate slab yardage with thickness across multiple sections."
- `/concrete-footing-calculator` — "Calculate footing concrete from linear footage and footing dimensions."
- `/rebar-calculator` — "Calculate rebar quantities for slabs, footings, and wall layouts."

---

### Styling
Same pattern as footing page: `max-w-3xl mx-auto px-4 pb-12`, card borders, divide-y for example rows, `space-y-4` for tips, stacked cards for FAQ.

### What stays unchanged
- SEO meta tags, calculator embed, no new files/components/dependencies

