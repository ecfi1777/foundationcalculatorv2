

# Copy refinements on `/concrete-calculator`

## Single file: `src/pages/ConcreteCalculator.tsx`

Three text-only edits.

### Edit 1: Contractor notes — tighten bullets (lines 108–116)

Replace the `contractorNotes` array with shorter, one-sentence bullets:

```js
const contractorNotes = [
  "Footings often change size across the same job.",
  "Garage slabs are almost always thicker than basement slabs.",
  "Townhouse jobs can mean three or four pours with different dimensions in one day.",
  "The hardest part isn't the math — it's keeping everything organized.",
  "Subgrade is never level. Budget waste into every pour.",
  "One wall height change moves every number downstream.",
  "If you're hand-adding totals from separate calculators, you'll miss something.",
];
```

### Edit 2: FAQ answer update (line 122)

Replace the answer for "What's the difference between this and a basic calculator?":

**Before:** `"Basic calculators handle one area at a time. This tool lets you build a full project with named areas, different types, and a running total."`

**After:** `"For simple one-off numbers, those work fine. This is built for real jobs where you're tracking multiple areas and making changes."`

### Edit 3: Internal links intro (before line 385)

Add a `<p>` between the `<h2>` heading and the `<nav>` grid:

```tsx
<p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-8">
  If you're working on a specific part of a job, you can jump straight to a dedicated calculator:
</p>
```

(Also remove the existing `mb-8` from the `<h2>` on line 382 since the new `<p>` provides the spacing.)

### What stays unchanged
- All layout, components, calculator logic, routing, state

