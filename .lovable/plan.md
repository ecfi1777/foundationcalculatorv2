

# Add SEO Content Sections to /concrete-calculator

## Summary
Add three new sections to `src/pages/ConcreteCalculator.tsx`: an intro section above the calculator, a differentiator section with comparison table below the calculator, and a "Why Contractors Use This" section. No other files touched.

## Changes (single file: `src/pages/ConcreteCalculator.tsx`)

### 1. Intro section — between Helmet block and `h-screen` div (after line 70)
Product-copy styled section (no `prose` class — clean, direct layout):
```tsx
<section className="max-w-3xl mx-auto px-4 pt-12 pb-6">
  <h2 className="text-xl font-semibold text-foreground mb-3">
    Concrete Calculator Built for Contractors
  </h2>
  <p className="text-sm text-muted-foreground mb-2">
    Most concrete calculators are designed for single pours like patios or small slabs.
    Real foundation work is different — it involves multiple areas like footings, walls,
    garage slabs, and basement floors, all calculated together.
  </p>
  <p className="text-sm text-muted-foreground">
    This tool is designed as a takeoff system. You can measure each area separately
    and track a running total across the entire job — the same way real estimates are done.
  </p>
</section>
```

### 2. Differentiator section with comparison table — below calculator, above Field Notes (line 83)
Full table comparing this tool to basic calculators:
```tsx
<section className="prose prose-sm dark:prose-invert max-w-none">
  <h2>This Is a Takeoff Tool, Not a Calculator</h2>
  <p>Most online concrete calculators give you one number for one shape. That works for a single pad pour — not for a foundation job with multiple areas.</p>
  <table>
    <thead>
      <tr><th>Feature</th><th>Basic Calculator</th><th>This Tool</th></tr>
    </thead>
    <tbody>
      <tr><td>Multiple areas per job</td><td>No</td><td>Yes</td></tr>
      <tr><td>Running project total</td><td>No</td><td>Yes</td></tr>
      <tr><td>Per-area waste adjustment</td><td>No</td><td>Yes</td></tr>
      <tr><td>Saved takeoffs</td><td>No</td><td>Yes</td></tr>
      <tr><td>PDF export</td><td>No</td><td>Yes</td></tr>
      <tr><td>Rebar & stone base tracking</td><td>No</td><td>Yes</td></tr>
    </tbody>
  </table>
</section>
```

### 3. "Why Contractors Use This" section — below differentiator, above Field Notes
```tsx
<section className="prose prose-sm dark:prose-invert max-w-none">
  <h3>Why Contractors Use This Instead of Basic Calculators</h3>
  <ul>
    <li>Measure multiple areas in one job (footings, walls, slabs)</li>
    <li>See a running total before ordering concrete</li>
    <li>Adjust waste per section</li>
    <li>Save and revisit takeoffs later</li>
    <li>Export a clean PDF for job files or estimates</li>
  </ul>
</section>
```

### What stays unchanged
- Hidden H1 remains the only H1
- All new headings are H2 or H3
- Calculator logic, layout, providers untouched
- Field Notes, FAQ, Related Calculators sections untouched
- No new files or imports

### Final section order
1. SEO meta + hidden H1 + JSON-LD
2. **NEW — Intro (product-copy style, no prose)**
3. Calculator (h-screen block)
4. **NEW — Differentiator with comparison table**
5. **NEW — Why Contractors Use This**
6. Field Notes (existing)
7. FAQ (existing)
8. Related Calculators (existing)

