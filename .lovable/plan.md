

# Improve Visual Polish of Calculator Panel (Left Side)

## File: `src/components/calculator/CalculatorLayout.tsx`

### Three line-level edits (lines 413–425)

**1. Left panel wrapper (line 414)**
`rounded-l-lg` → `rounded-l-xl border border-border bg-card/60`

**2. Footer (line 421)**
`bg-card` → `bg-background/50 px-4 py-3`

**3. Right panel (line 425)**
`rounded-r-lg` → `rounded-r-xl` (keep `border-l border-border bg-card`, no margin added)

### What does NOT change
- Layout structure, mobile layout, calculator logic
- No gaps/margins between panels
- No new dependencies

