

# Refinement pass on `/concrete-calculator`

## Single file change: `src/pages/ConcreteCalculator.tsx`

Four targeted edits — no new sections, no layout changes, no logic changes.

---

### 1. Takeoff comparison cards — clearer labels (lines 83-98, 288-297)

Update `takeoffTools` data to use structured fields `bestFor` and `thisTool` instead of `strength`/`comparison`. Update the card JSX to render explicit labels:

```
Bluebeam
Best for: Drawing-based takeoffs with markup and measurement tools.
This tool: Faster when you already have dimensions — no plans required.
```

Same pattern for PlanSwift and Stack. Each card gets two labeled lines with bold "Best for:" and "This tool:" prefixes.

### 2. Differentiator intro copy — tighten (line 191)

Replace the current paragraph with a shorter, harder-hitting version:

> "Most concrete calculators handle one pour at a time. That works for a single slab — but real foundation jobs have footings, walls, and slabs at different sizes. When you're juggling multiple areas, one input box falls apart."

### 3. Contractor insights — improve scannability (lines 331-340)

- Increase bullet spacing from `space-y-3` to `space-y-4`
- Add `leading-relaxed` to each list item for better line height
- Use a slightly bolder bullet (e.g., `font-bold` on the bullet span)

### 4. Internal links — more specific descriptions (lines 76-81)

Update `relatedCalculators` descriptions:

- **Slab**: "Calculate slab yardage with adjustable thickness across multiple sections — driveways, garage floors, patios, and basements."
- **Footing**: "Calculate footing concrete from linear footage and footing dimensions — continuous footings, frost walls, and stepped sections."
- **Wall**: "Calculate wall concrete for foundation walls and retaining walls — measured by segment with adjustable heights and thicknesses."
- **Rebar**: "Calculate rebar quantities for slabs, footings, and walls — includes spacing, overlap, and layout options."

---

### What stays unchanged
- All section order, layout structure, calculator logic, state, routing
- No new components, no new dependencies
- One file changed: `src/pages/ConcreteCalculator.tsx`

