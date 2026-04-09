

# Fix: Prevent swipe gesture from triggering on Calculator Tab Bar

## Problem
The horizontal swipe gesture that switches between Calculator and Quantities tabs (lines 309-319 in `CalculatorLayout.tsx`) is also triggered when the user swipes horizontally across the `CalculatorTabBar` to scroll between calculator types (Footings, Walls, Grade Beams, etc.). This causes unintended tab switches.

## Solution
Move the `CalculatorTabBar` **outside** of the swipe-detecting container so that swiping on it does not trigger the calculator/quantities tab switch.

## Scope
One file only: `src/components/calculator/CalculatorLayout.tsx`

## Change

In the mobile render path, the `CalculatorTabBar` is currently inside the swipe container div (line 323). Move it above that div so swipe events on the tab bar are not captured.

**Current structure (lines 309-335):**
```
<div style={{ touchAction: 'pan-y' }} onTouchStart={...} onTouchEnd={...}>  ← swipe container
  {mobileTab === "calculator" ? (
    <div>
      <CalculatorTabBar />        ← inside swipe zone
      <ActiveForm />
    </div>
  ) : (
    <QuantitiesPanel />
  )}
</div>
```

**New structure:**
```
{mobileTab === "calculator" && (
  <div className="px-3 pt-3">
    <CalculatorTabBar />          ← outside swipe zone
  </div>
)}
<div style={{ touchAction: 'pan-y' }} onTouchStart={...} onTouchEnd={...}>  ← swipe container
  {mobileTab === "calculator" ? (
    <div>
      <ActiveForm />
    </div>
  ) : (
    <QuantitiesPanel />
  )}
</div>
```

This keeps the tab bar fixed above the swipeable area. Horizontal swiping on the calculator type tabs will only scroll through the tab options, not switch between Calculator and Quantities views.

