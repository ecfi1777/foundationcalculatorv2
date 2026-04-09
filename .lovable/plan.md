

# Mobile Quantities Indicator

## Problem
On mobile, there's no visual cue that the Quantities panel has measurements. Users don't know there's data to review without tapping over to check.

## Solution
Add a small count badge next to the "View Quantities" toggle text showing how many areas have data. The badge only appears when there are one or more visible areas.

## Scope
One file: `src/components/calculator/CalculatorLayout.tsx`

## Change

In the mobile toggle button (lines 296-307), compute the count of visible areas using the same filter logic as `QuantitiesPanel` (`!a.isDraft || (hasRequiredData(a) && a.hasUserModifiedDimensions)`), then render a small numeric badge next to "View Quantities" when the count is greater than zero.

**Steps:**
1. Import `hasRequiredData` from `@/types/calculator` (already used elsewhere in the app)
2. Add a `useMemo` computing `visibleAreaCount` from `state.areas` using the same filter
3. In the "View Quantities" text (line 302), append a small badge span showing the count when `visibleAreaCount > 0` — e.g. a small rounded pill like `<span className="ml-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{visibleAreaCount}</span>`
4. The badge does NOT show when the user is already on the quantities tab (the "Back to Calculator" state)

**Result:** The toggle reads "View Quantities `3`" with a small pill badge, giving users immediate awareness that there are measurements to review.

