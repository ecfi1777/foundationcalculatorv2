

# Copy refinements on `/concrete-calculator`

## Single file: `src/pages/ConcreteCalculator.tsx`

Two text-only edits.

### Edit 1: Takeoff section (after line 309, before `</div>` closing)

After the grid of takeoff tool cards (line 309) and before the closing `</div>` on line 310, add three new paragraphs:

```
<p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mt-6">
  If you already have full plans and need a complete takeoff, those tools make sense.
</p>
<p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
  But if you're working with real numbers in the field or making quick adjustments, they're slower than they need to be.
</p>
<p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
  That's where this tool fits.
</p>
```

### Edit 2: Mistake section (after line 325, before existing closing paragraphs)

Insert a new paragraph after the grid of mistake cards and before the existing closing paragraphs:

```
<p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
  Most of the time, the mistake isn't the math — it's losing track of one part of the job.
</p>
```

### What stays unchanged
- All layout, components, calculator logic, routing, state
- All other sections

