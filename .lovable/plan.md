

# Add Semantic `<main>` to Content Areas

## Scope
One file: `src/components/calculator/CalculatorLayout.tsx`

## Changes

1. **Mobile (line 320):** Change the swipeable content `<div>` to `<main>`, and its closing `</div>` on line 345 to `</main>`

2. **Desktop (line 405):** Change `<div className="flex flex-1 overflow-hidden">` to `<main className="flex flex-1 overflow-hidden">`, and its closing `</div>` on line 421 to `</main>`

All classes, attributes, and children remain unchanged — only the element tag changes from `div` to `main`.

