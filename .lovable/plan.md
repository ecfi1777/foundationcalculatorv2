

# Revamp Comparison Section on /concrete-calculator

## File: `src/pages/ConcreteCalculator.tsx`

### Summary

Remove the "Differentiator" section (lines 129–165) and "Why Contractors Use This" section (lines 167–177). Replace with two new sections in a restructured layout.

### Layout restructuring (lines 124–295)

The current SEO content block wraps everything in one `max-w-4xl` container. We split it:

```text
{!isExpanded && (
  <div className="bg-background text-foreground">

    ── 1. COMPARISON SECTION (full-width, outside max-w-4xl) ──

    ── 2. REMAINING SEO CONTENT (max-w-4xl container) ──
        → "What this looks like on a real job" (NEW, first item)
        → Field Notes (existing, unchanged)
        → FAQ (existing, unchanged)
        → Related Calculators (existing, unchanged)

  </div>
)}
```

### 1. Comparison section (full-width)

- Wraps in `<section className="bg-muted/40 border-y border-border">` with `max-w-5xl` inner container
- Eyebrow: "Why this is different"
- H2: "Not all concrete calculators are built for real jobs"
- Two lines of supporting text in `max-w-2xl` centered block
- Comparison table in `bg-card rounded-xl shadow-sm border` card with `overflow-x-auto` and `min-w-[720px]`
- 8 rows with exact content from the spec
- Column styling: Feature = `font-medium text-foreground`, Basic = `text-muted-foreground`, TFC = `font-medium text-foreground`
- Row padding: `py-4 px-4`, separators: `border-b border-border`
- Closing line: "Built for real foundation takeoffs — not single pours."

### 2. "What this looks like on a real job" section

- Inside `max-w-4xl` container as first item
- Card style: `rounded-lg border border-border bg-card p-6`
- No `prose` classes — uses standard utility classes
- H3, paragraph, 4-item `list-disc` list, closing paragraph

### What does NOT change

- Calculator logic, state, providers, intro section
- Field Notes, FAQ, Related Calculators (content preserved exactly)
- No new dependencies or animations

### File modified

- `src/pages/ConcreteCalculator.tsx` — lines 124–295

