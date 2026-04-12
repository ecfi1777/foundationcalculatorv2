
# Separate startup behavior for dedicated calculator pages

## Verified root cause
The current provider always starts through the shared `/app` path:

1. `CalculatorProvider` calls `loadState()` and reads `tfc_calculator_state`
2. `migrateLoadedState()` drops draft areas but keeps the stored `activeTab`
3. Provider mounts with that persisted tab
4. The existing auto-provision effect creates a fresh draft for that tab
5. `TabInitializer` tries to correct the tab later

That means the dedicated pages are still inheriting shared app state first, which is why a page like `/concrete-wall-calculator` can still start from Footings.

## Implementation plan

### 1. Update `src/hooks/useCalculatorState.tsx`
Extend `CalculatorProvider` with route-aware startup options:

- `initialTab?: CalculatorType`
- `hydrateFromStorage?: boolean` (default `true`)

Then change provider initialization so it branches up front:

- If `hydrateFromStorage !== false`: keep the current `/app` behavior and use `loadState()`
- If `hydrateFromStorage === false`: skip `loadState()` entirely and start from a clean state:
  - `areas: []`
  - `activeTab: initialTab ?? "footing"`
  - `activeAreaId: null`

Keep the existing auto-provision effect unchanged so it creates the first draft for that tab naturally.

### 2. Disable shared localStorage side effects for dedicated-page mode
When `hydrateFromStorage` is `false`, the provider should also skip shared calculator persistence behavior so dedicated pages do not overwrite `/app` state:

- do not write `tfc_calculator_state`
- do not set/clear `tfc_anon_has_data`
- do not clear shared calculator storage on `RESET`

This keeps `/app`’s saved local workflow intact while dedicated pages stay fresh every visit.

### 3. Remove `TabInitializer`
Delete the `TabInitializer` export and stop using any post-mount `SET_TAB` correction path.

The dedicated pages should get the correct tab from the provider’s initial state, not from a later dispatch.

### 4. Update dedicated calculator pages only
Change these pages to use the provider in clean route-specific mode:

- `src/pages/ConcreteSlabCalculator.tsx`
  - `<CalculatorProvider initialTab="slab" hydrateFromStorage={false}>`
- `src/pages/ConcreteFootingCalculator.tsx`
  - `<CalculatorProvider initialTab="footing" hydrateFromStorage={false}>`
- `src/pages/ConcreteWallCalculator.tsx`
  - `<CalculatorProvider initialTab="wall" hydrateFromStorage={false}>`

Also remove `TabInitializer` imports/usages from those files.

## What stays unchanged
- `/app` keeps the current storage-backed workflow
- `src/pages/ConcreteCalculator.tsx` stays on the shared workflow
- calculation logic
- backend/auth/database logic
- existing auto-provision behavior

## Technical notes
- Exact app tab values already in use are: `"slab"`, `"footing"`, and `"wall"`
- The existing auto-provision effect is the correct place to create the first area; it should not be replaced
- The key safeguard here is not just “skip hydrate” but also “skip persist” for dedicated pages, otherwise those routes would overwrite `/app`’s stored state

## Verification
1. Open `/concrete-slab-calculator` → fresh draft opens on Slabs
2. Open `/concrete-footing-calculator` → fresh draft opens on Footings
3. Open `/concrete-wall-calculator` → fresh draft opens on Walls
4. Confirm no wrong-tab flash on any dedicated page
5. Return to `/app` and confirm prior local calculator state still restores as before
