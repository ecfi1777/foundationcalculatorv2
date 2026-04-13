

# Copy refinements on `/concrete-calculator`

## Single file: `src/pages/ConcreteCalculator.tsx`

Three text-only edits — no layout, logic, or structural changes.

### Edit 1: Hero section (after line 159)

Add a new `<p>` after the "not single pours" line:

```
<p className="mt-2 text-sm text-muted-foreground text-center">
  Built for real foundation work — not just one-off calculations.
</p>
```

### Edit 2: Differentiator intro (after line 192)

Add a new `<p>` after the "one input box falls apart" paragraph:

```
<p className="text-base text-muted-foreground text-center max-w-2xl mx-auto mt-2">
  When you're working on a real job, you shouldn't have to keep restarting your numbers just to make one change.
</p>
```

### Edit 3: Example closing paragraph (lines 271–273)

Replace the text content:

**Before:** "Change one area and the total updates — without redoing the rest."

**After:** "Instead of running each section separately and trying to keep track of it, everything stays organized in one place — and your total stays right as things change."

### What stays unchanged
- All layout, components, calculator logic, routing, state
- Comparison table, project card, all other sections

