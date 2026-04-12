

# Fix: Revert defaultTab initializer, use layout-level tab dispatch

## Problem

The lazy initializer override (`activeAreaId: null`) conflicts with the auto-provision startup flow, causing the wrong tab to appear on dedicated calculator pages.

## Approach

1. **Revert** the `CalculatorProvider` initializer to its original form — no `defaultTab` prop, no initializer override.
2. **Add a small `TabInitializer` component** inside `useCalculatorState.tsx` that uses `useLayoutEffect` to dispatch `SET_TAB` before the browser paints. This works *with* the existing flow: `SET_TAB` properly handles draft cleanup and sets `activeAreaId: null`, then the existing auto-provision effect creates a fresh draft for the correct tab.
3. **Each page** renders `<TabInitializer tab="..." />` as a child of `CalculatorProvider`.

`useLayoutEffect` ensures the dispatch fires synchronously before paint — no visible flash of the wrong tab.

## Changes

### 1. `src/hooks/useCalculatorState.tsx`

Revert `CalculatorProvider` signature and `useReducer` call to original:

```tsx
export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = useReducer(reducer, undefined, loadState);
  // ... rest unchanged
```

Add exported `TabInitializer` component:

```tsx
export function TabInitializer({ tab }: { tab: CalculatorType }) {
  const { state, dispatch } = useCalculatorState();
  React.useLayoutEffect(() => {
    if (state.activeTab !== tab) {
      dispatch({ type: "SET_TAB", tab });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
```

### 2. Each dedicated page (`ConcreteSlabCalculator`, `ConcreteFootingCalculator`, `ConcreteWallCalculator`)

Replace `<CalculatorProvider defaultTab="...">` with:

```tsx
<CalculatorProvider>
  <TabInitializer tab="wall" />  {/* or "slab" / "footing" */}
  <ProjectProvider>
    <CalculatorLayout />
  </ProjectProvider>
</CalculatorProvider>
```

## What does NOT change

- `/app` and `ConcreteCalculator.tsx` — no `TabInitializer`, behavior identical
- Reducer logic, calculation logic, auto-provision, Supabase, localStorage

