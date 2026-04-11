

# Page Mode / Workspace Mode for the Calculator

## Summary
Add a toggle between **Page Mode** (default, contained) and **Workspace Mode** (expanded, immersive) on the calculator. State lives in `ConcreteCalculator.tsx` and flows down through props.

## Changes

### 1. `src/pages/ConcreteCalculator.tsx`
- Add `const [isExpanded, setIsExpanded] = useState(false)`
- Pass `isExpanded` and `onToggleExpand` to `CalculatorLayout`
- Wrap calculator in a conditional container:
  - Page mode: `max-w-7xl mx-auto px-4` (current)
  - Workspace mode: `max-w-[1600px] mx-auto px-6 min-h-[85vh]`
  - Add `transition-all duration-300` for smooth width change
- Conditionally hide intro section and SEO content sections when `isExpanded` is true

### 2. `src/components/calculator/CalculatorLayout.tsx`
- Accept `isExpanded?: boolean` and `onToggleExpand?: () => void` props
- Pass both to `AppHeader`

### 3. `src/components/calculator/AppHeader.tsx`
- Accept `isExpanded?: boolean` and `onToggleExpand?: () => void` props
- Render a ghost button on the right side of the header (desktop only):
  - Page mode: `<Maximize2 size={16} />` + **"Open Workspace"**
  - Workspace mode: `<Minimize2 size={16} />` + **"Exit Workspace"**

### Files modified
- `src/pages/ConcreteCalculator.tsx`
- `src/components/calculator/CalculatorLayout.tsx`
- `src/components/calculator/AppHeader.tsx`

### Unchanged
- All calculator logic, forms, calculations
- Mobile layout (toggle hidden on mobile)
- SEO content (conditionally hidden, not removed)
- All text copy

