

# Constrain Calculator Width on /concrete-calculator

## Single file change: `src/pages/ConcreteCalculator.tsx`

### Change
Wrap the calculator's `h-screen` div (lines 88–95) inside a centered max-width container:

```tsx
{/* ── The real TFC calculator — full viewport height ── */}
<div className="max-w-7xl mx-auto px-4">
  <div className="h-screen">
    <CalculatorProvider>
      <ProjectProvider>
        <CalculatorLayout />
      </ProjectProvider>
    </CalculatorProvider>
  </div>
</div>
```

This adds `max-w-7xl mx-auto px-4` as an outer wrapper around the existing `h-screen` div. The calculator stays full-height but is now width-constrained and centered, visually aligning with the intro (`max-w-3xl`) and SEO content sections below. `max-w-7xl` (80rem / 1280px) keeps enough room for inputs + quantities sidebar while feeling like part of a landing page rather than a full-bleed app.

No other lines or files changed.

