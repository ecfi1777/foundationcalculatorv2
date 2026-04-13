

# Fix inconsistent calculator width on SEO pages

## Current state

`/concrete-calculator` wraps its calculator in:
```html
<div className="mx-auto max-w-5xl px-4 mb-16">
  <div className="min-h-[70vh]">
    <CalculatorProvider>...</CalculatorProvider>
  </div>
</div>
```

The other 4 pages use only `<section className="pb-8">` with no max-width — causing full-width stretching on large screens.

## Plan

### 1. Create `SeoCalculatorContainer`

**New file**: `src/components/calculator/SeoCalculatorContainer.tsx`

Exact same classes as `/concrete-calculator`:
```tsx
const SeoCalculatorContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-5xl px-4 mb-16">
    <div className="min-h-[70vh]">
      {children}
    </div>
  </div>
);
```

### 2. Apply to 4 SEO pages

Replace the bare `<section className="pb-8">` wrapper around each `<CalculatorProvider>` block with `<SeoCalculatorContainer>`:

- `src/pages/ConcreteFootingCalculator.tsx`
- `src/pages/ConcreteSlabCalculator.tsx`
- `src/pages/ConcreteWallCalculator.tsx`
- `src/pages/RebarCalculator.tsx`

Each becomes:
```tsx
<SeoCalculatorContainer>
  <CalculatorProvider ...>
    <ProjectProvider ...>
      <CalculatorLayout ... />
    </ProjectProvider>
  </CalculatorProvider>
</SeoCalculatorContainer>
```

### 3. Do NOT touch

- `ConcreteCalculator.tsx` (already correct)
- Calculator logic, SEO content, headers, mobile layout

### Files changed
1. **New**: `src/components/calculator/SeoCalculatorContainer.tsx`
2. `src/pages/ConcreteFootingCalculator.tsx`
3. `src/pages/ConcreteSlabCalculator.tsx`
4. `src/pages/ConcreteWallCalculator.tsx`
5. `src/pages/RebarCalculator.tsx`

