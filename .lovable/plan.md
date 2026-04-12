

# Cap Workspace Height — Revised Approach

## Change: `src/components/calculator/CalculatorLayout.tsx`

**Line 412** — Replace the current `<main>` classes:

```
flex min-h-[600px] items-stretch overflow-hidden
```
→
```
flex h-[75vh] min-h-[600px] max-h-[900px] items-stretch overflow-hidden
```

One class addition (`h-[75vh]` and `max-h-[900px]`). No hard-coded pixel subtraction. The existing internal shell structure (scrollable body + pinned footer) activates automatically once the parent has a concrete height.

### Files modified
- `src/components/calculator/CalculatorLayout.tsx` — one line change

### Unchanged
- Everything else

