

# Enhance `/concrete-footing-calculator` page

## Single file change: `src/pages/ConcreteFootingCalculator.tsx`

Rewrite the page content below the calculator to match the slab page pattern. The hero (H1 + intro) and calculator embed stay as-is, with only the intro paragraph shortened. Everything below the calculator is replaced.

---

### Section order

1. **H1 + short intro** — keep existing, replace intro paragraph with 2–3 sentences about linear footage, width/depth, and multiple footing sizes
2. **Calculator** — no change (footing tab, fresh state)
3. **Formula** — "How to Calculate Concrete for Footings"
4. **Real-World Example** — "What a Real Footing Layout Looks Like" with 3 line items + total
5. **Contractor Tips** — 5 bullets
6. **FAQ** — 7 items, all expanded
7. **Internal Links** — 2×2 grid (slab, wall, rebar, main calculator)
8. **Link back button** — same as current

---

### Content details

**Intro (replace lines 23-25):**
"Footing concrete is calculated from linear footage, width, and depth. Most jobs have more than one footing size — different sections for main walls, garages, and frost footings. Enter your dimensions above and the calculator handles the math."

**Formula card:**
`Length (ft) × Width (ft) × Depth (ft) ÷ 27 = cubic yards`
"Width and depth are usually measured in inches — divide by 12 to convert to feet. The calculator handles this automatically."

**Example card (3 items):**
- Main Footing: 200 LF × 24″ × 12″ → 14.81 yd³
- Garage Footing: 120 LF × 18″ × 10″ → 5.56 yd³
- Frost Footing Sections: 60 LF × 24″ × 12″ → 4.44 yd³
- Total: 24.81 yd³
- Intro: "Most jobs don't use one footing size. Different sections often have different widths and depths."
- Closing: "Adjust any section and the total updates automatically."

**Contractor Tips (5 bullets):**
- Footing sizes often vary across the same job — main footings, garage footings, and porch footings may all differ
- Garage and porch footings are often narrower or shallower than main foundation footings
- Frost footings may require deeper or wider sections depending on local frost depth requirements
- Stepped footings need to be measured section by section — don't average the depth
- Always account for waste and irregular trenches — 5–10% extra is standard

**FAQ (7 items, expanded):**
1. How many yards of concrete per 100 ft of footing? → Depends on width and depth. A 20″ × 12″ footing at 100 LF needs about 6.17 yd³. A 24″ × 12″ footing needs about 7.41 yd³.
2. What is a typical footing size? → Residential footings are commonly 16″–24″ wide and 8″–12″ deep. Size depends on load, soil, and local building codes.
3. How do I calculate footing concrete from linear feet? → Multiply linear feet by width (in feet) by depth (in feet), then divide by 27. Convert inches to feet first.
4. What is a frost footing? → A frost footing extends below the local frost line to prevent heaving. Depths vary by region — typically 36″–48″ in cold climates.
5. How do stepped footings affect concrete quantity? → Each step adds volume. Measure each stepped section separately with its own depth, then combine the totals.
6. How much extra concrete should I order? → Plan for 5–10% extra. Trenches are rarely perfectly uniform, and waste from spillage adds up on longer runs.
7. Do footings need rebar? → Most footings require continuous rebar per code. Check local requirements — typically two horizontal bars with vertical ties at wall intersections.

**Internal Links (2×2 grid):**
- `/concrete-calculator` — "Full concrete calculator for footings, walls, slabs, and more — all in one project."
- `/concrete-slab-calculator` — "Calculate slab yardage with thickness across multiple sections."
- `/concrete-wall-calculator` — "Calculate concrete for foundation walls and retaining walls."
- `/rebar-calculator` — "Calculate rebar quantities for slabs, footings, and wall layouts."

---

### Styling
Follows exact same pattern as the slab page: `max-w-3xl mx-auto px-4 pb-12`, card borders, divide-y for example rows, `space-y-4` for tips, stacked cards for FAQ.

### What stays unchanged
- SEO meta tags (already good)
- Calculator embed with `initialTab="footing"` and `hydrateFromStorage={false}`
- No new files, components, dependencies, or logic changes

