

# Fix: Prevent ProjectProvider from resetting calculator state on dedicated pages

## Root Cause (confirmed)

In `src/hooks/useProject.tsx` (lines 547–552), a `useEffect` calls `clearAllState()` when `user` is falsy. `clearAllState` dispatches `RESET`, which resets `activeTab` to `"footing"`. This fires on mount for signed-out users, overriding the `initialTab` set by `CalculatorProvider` on dedicated pages.

## Changes

### 1. `src/hooks/useProject.tsx`

- Add optional `clearCalculatorOnSignOut?: boolean` prop (default `true`)
- Gate the signed-out effect: only call `clearAllState()` when `clearCalculatorOnSignOut !== false`

```tsx
export function ProjectProvider({ 
  children, 
  clearCalculatorOnSignOut = true 
}: { 
  children: ReactNode; 
  clearCalculatorOnSignOut?: boolean;
}) {
  // ...existing code...

  useEffect(() => {
    if (!user && clearCalculatorOnSignOut) {
      clearAllState();
    }
  }, [user, clearAllState, clearCalculatorOnSignOut]);
```

### 2. Dedicated calculator pages

Update `ConcreteSlabCalculator.tsx`, `ConcreteFootingCalculator.tsx`, `ConcreteWallCalculator.tsx`:

```tsx
<CalculatorProvider initialTab="wall" hydrateFromStorage={false}>
  <ProjectProvider clearCalculatorOnSignOut={false}>
    <CalculatorLayout />
  </ProjectProvider>
</CalculatorProvider>
```

### 3. No changes to `/app` or any other files

`/app` uses `<ProjectProvider>` without the prop → defaults to `true` → existing behavior preserved.

