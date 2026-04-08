

# Fix: Tab bar disappears on Android Chrome

## Problem
The mobile wrapper uses `h-screen` (100vh), which on Android Chrome includes the browser address bar height, pushing the fixed tab bar below the visible viewport.

## Change — `src/components/calculator/CalculatorLayout.tsx`

**Line 259**: Change `h-screen` to `h-[100dvh]` on the mobile wrapper div only. The desktop wrapper (line 313) remains unchanged.

```tsx
// Before
<div className="flex flex-col h-screen bg-background">

// After
<div className="flex flex-col h-[100dvh] bg-background">
```

No other files modified.

