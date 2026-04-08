

# Fix: Mobile Tab Bar Positioning

## Problem
The tab bar uses `fixed` positioning inside a `h-[100dvh]` flex container, causing overlap with content (requiring `pb-16` compensation) and an outer-scroll bug in Firefox.

## Changes — `src/components/calculator/CalculatorLayout.tsx`

**Change 1 (line 284):** Remove `pb-16` from the scrollable content div.
- Before: `className="flex-1 overflow-y-auto px-3 pb-16"`
- After: `className="flex-1 overflow-y-auto px-3"`

**Change 2 (lines 310–311):** Make the tab bar a natural flex child with `shrink-0` instead of `fixed` positioning.
- Before: `className="fixed bottom-0 left-0 right-0 border-t-2 border-border bg-card flex"`
- After: `className="border-t-2 border-border bg-card flex shrink-0"`

No other files modified. Desktop branch unchanged.

