

# Restyle Intro Section on /concrete-calculator

## File: `src/pages/ConcreteCalculator.tsx` — lines 76–91

Replace the current plain intro `<section>` with a modern, polished product intro:

### Structure

```
<section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
  {/* Eyebrow / kicker */}
  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
    Professional Takeoff Tool
  </p>

  {/* Main heading — larger, bolder */}
  <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
    Concrete Calculator Built for Contractors
  </h2>

  {/* Supporting copy — comfortable width, improved spacing */}
  <div className="max-w-2xl mx-auto space-y-3">
    <p className="text-base text-muted-foreground leading-relaxed">
      Most concrete calculators handle a single pour. Real foundation work involves
      multiple areas — footings, walls, slabs — all calculated together.
    </p>
    <p className="text-base text-muted-foreground leading-relaxed">
      This tool is a takeoff system. Measure each area separately and track a running
      total across the entire job — the way real estimates are done.
    </p>
  </div>

  {/* Feature value chips */}
  <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
    {["Multi-area takeoffs", "Running totals", "PDF exports"].map((item) => (
      <span key={item}
        className="inline-flex items-center rounded-full border border-border bg-muted/50
                   px-4 py-1.5 text-xs font-medium text-muted-foreground">
        {item}
      </span>
    ))}
  </div>
</section>
```

### What changes
- Eyebrow kicker "Professional Takeoff Tool" above heading
- Heading bumped to `text-3xl sm:text-4xl font-bold`, centered
- Copy narrowed to `max-w-2xl`, bumped to `text-base`, better `leading-relaxed` spacing
- Section centered with more vertical padding (`pt-16 pb-10`)
- Three subtle pill-style feature chips below copy
- Copy substance unchanged — only minor tightening for flow

### What does NOT change
- `!isExpanded` conditional stays
- Calculator logic, state, layout, SEO content below fold
- No new dependencies

