

# Copy-only update for `/concrete-calculator`

## Changes — `src/pages/ConcreteCalculator.tsx` only

No layout, component, routing, or logic changes. Text and data arrays only.

### 1. Hero subtext (lines 108–113)

Replace the two paragraphs with contractor-focused copy:

- Main subline: Reference footings, walls, and slabs. Emphasize saving each section and adjusting when things change. Keep the running total idea.
- Supporting line: Mention feet/inches/fractions and multi-area projects in plain field language.

Example direction:
```
"Set up your footings, walls, and slabs as separate areas.
Save each one, adjust it when things change, and keep your total right."

"Works in feet, inches, and fractions — built for multi-area jobs, not single pours."
```

### 2. Differentiator intro (add a short paragraph before the table, after the H2, ~lines 141–143)

Insert 2–3 sentences between the H2 and the comparison table:

- Most calculators give you one box for one pour
- Real jobs have multiple footing widths (e.g. 24″ main footing vs 18″ garage footing), different slab thicknesses (5″ garage vs 4″ basement), varying wall heights
- Gets harder when you're running multiple pours in one day — three driveways, each a different size

Keep it short and specific with at least one real numeric example.

### 3. Real-world example section (lines 67–73 data + lines 188–218 copy)

**Replace `exampleAreas` array** with a broader set reflecting flatwork + foundation scenarios:

- Garage Slab (24′×24′×5″)
- Walkway (30′×4′×4″)
- Patio (16′×12′×4″)
- Sidewalk (40′×4′×4″)
- Main Footing (24″×12″, perimeter)
- Frost Footing (18″×10″, garage)
- Foundation Wall (8″×8′, perimeter)
- Basement Slab (varied thickness)

**Replace section copy:**

- Opening paragraph: explain that typical calculators force you to run each of these separately and re-add totals by hand
- Add one concrete mistake example: e.g. "You update the garage slab from 4 inches to 5 inches but forget to re-add the walkway and patio. Your total is off by 2 yards and you don't catch it until the truck shows up short."
- Closing: keeping all areas in one place, editing one section without touching the rest, always seeing the correct total

### Files changed
- `src/pages/ConcreteCalculator.tsx` — copy/data only

### Files NOT changed
- No calculator logic, hooks, state, routing, layout, or component files
