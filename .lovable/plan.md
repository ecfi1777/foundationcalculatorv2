

# Set Default Active Tab per Calculator Page (Revised)

## Verified Tab Values

From `src/types/calculator.ts`, the exact `CalculatorType` values are:
- `"slab"` — for slabs
- `"footing"` — for footings (singular)
- `"wall"` — for walls (singular)
- `"gradeBeam"`, `"pierPad"`, `"cylinder"`, `"steps"`, `"curbGutter"` — others

## Approach: Override Initial State (No useEffect)

Instead of dispatching `SET_TAB` after mount, pass `defaultTab` into the provider so `useReducer` initializes with the correct tab from the start — zero flicker, zero extra render.

## Changes

### 1. `src/hooks/useCalculatorState.tsx`

- Add optional `defaultTab?: CalculatorType` prop to `CalculatorProvider`
- Thread `defaultTab` into the `useReducer` initializer so the very first state has the correct `activeTab`

```tsx
// Signature change
export function CalculatorProvider({
  children,
  defaultTab,
}: {
  children: React.ReactNode;
  defaultTab?: CalculatorType;
}) {
  const [state, baseDispatch] = useReducer(
    reducer,
    defaultTab,                         // pass as initializerArg
    (dt) => {                           // initializer receives it
      const loaded = loadState();
      if (dt) {
        return { ...loaded, activeTab: dt, activeAreaId: null };
      }
      return loaded;
    },
  );
  // ... rest unchanged
```

This means the reducer's very first state already has the correct tab — no corrective dispatch, no flash.

### 2. `src/pages/ConcreteSlabCalculator.tsx`

```tsx
<CalculatorProvider defaultTab="slab">
```

### 3. `src/pages/ConcreteFootingCalculator.tsx`

```tsx
<CalculatorProvider defaultTab="footing">
```

### 4. `src/pages/ConcreteWallCalculator.tsx`

```tsx
<CalculatorProvider defaultTab="wall">
```

## What Does NOT Change

- `/app` — no `defaultTab` prop, behavior identical
- Reducer logic, calculation logic, Supabase, localStorage persistence
- `ConcreteCalculator.tsx` (main SEO hub page)

## Technical Detail

`useReducer(reducer, initializerArg, initializer)` — the third argument is a lazy initializer that receives the second argument. By passing `defaultTab` as the second argument and wrapping the existing `loadState()` call inside the initializer, we override `activeTab` before the first render.

