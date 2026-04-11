

# Center & Card-Wrap the /concrete-calculator Page

## Summary
Wrap each SEO content section below the calculator in a card container and tighten the page's vertical rhythm so the whole page reads as one centered, modular system.

## Single file change: `src/pages/ConcreteCalculator.tsx`

### 1. Page rhythm alignment
- **Intro** stays `max-w-3xl` (narrower, leading copy)
- **Calculator** stays `max-w-7xl` (wide workspace)
- **Content below** stays `max-w-5xl` (medium-wide, visually between the two)

No width changes needed — the current widths already create a good centered hierarchy.

### 2. Wrap each content section in a card container

Replace the bare `<section className="prose ...">` wrappers with a card-style container for each of the 5 sections:

```tsx
<section className="rounded-lg border border-border bg-card p-6 prose prose-sm dark:prose-invert max-w-none">
```

Apply this to:
- **Differentiator** (line 104)
- **Why Contractors Use This** (line 142)
- **Field Notes** (line 154)
- **FAQ** (line 187) — not a prose section, so just: `rounded-lg border border-border bg-card p-6`
- **Related Calculators** (line 251) — same non-prose card style

### 3. Reduce inter-section gap slightly
Change the outer `space-y-16` (line 101) to `space-y-10` so the cards feel like a cohesive system rather than isolated blocks spaced far apart.

### What stays unchanged
- All text copy, headings, links
- Calculator logic and workspace layout
- Mobile behavior (cards naturally stack)
- JSON-LD schemas
- Intro section above calculator

