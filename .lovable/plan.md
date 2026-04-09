

# Create Concrete Calculator SEO Landing Page

## Scope
- **New file:** `src/pages/ConcreteCalculator.tsx`
- **Modified:** `src/App.tsx` (add import + route)
- **Modified:** `package.json` (add `/concrete-calculator` to reactSnap include)

No other files touched. No internal hooks (useAuth, useProject, etc.).

## Changes

### 1. Create `src/pages/ConcreteCalculator.tsx`
Standalone public landing page with:
- SEO component with concrete calculator-specific title/description/canonical
- Simple slab calculator using `calcSlabSection` from `@/lib/calculations`
- Formula display, results with waste factor
- CTA linking to signup
- Field notes content section, FAQ section, related calculator links
- AppFooter at bottom

### 2. `src/App.tsx`
- Add import for `ConcreteCalculator` after the `NotFound` import
- Add route `<Route path="/concrete-calculator" element={<ConcreteCalculator />} />` after the how-it-works routes, before the catch-all

### 3. `package.json`
- Add `"/concrete-calculator"` to the `reactSnap.include` array after `"/"`

## Note
The user's message was truncated at Change 3 — the route to add to reactSnap is inferred as `"/concrete-calculator"` based on context. The JSX in the user's message lost its tags (likely a formatting issue); I will reconstruct the component faithfully using the provided structure: heading, description, calculator card with inputs/button/formula/results/CTA, field notes section, FAQ section, and related calculators section.

