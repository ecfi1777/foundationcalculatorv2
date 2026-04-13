

# Open Workspace / Exit Workspace — Implementation Plan

## Verified tab mappings

Confirmed from `src/types/calculator.ts` — internal `CalculatorType` values:

| SEO page | `tab` param | `from` param |
|---|---|---|
| `/concrete-calculator` | `footing` | `/concrete-calculator` |
| `/concrete-slab-calculator` | `slab` | `/concrete-slab-calculator` |
| `/concrete-footing-calculator` | `footing` | `/concrete-footing-calculator` |
| `/concrete-wall-calculator` | `wall` | `/concrete-wall-calculator` |
| `/rebar-calculator` | `footing` | `/rebar-calculator` |

Rebar has no standalone tab — `footing` is already used (`initialTab="footing"`). Comment will document this.

## Changes

### 1. New file: `src/lib/workspaceHandoff.ts`

Three concerns in one small module:
- **`stashDraft(state)`** — writes calculator state to `sessionStorage` key `tfc_workspace_handoff`
- **`consumeDraft()`** — reads + deletes that key, returns parsed state or null
- **`stashExitTarget(path)` / `getExitTarget()`** — persists last SEO page in `localStorage` key `tfc_last_calculator_page`

### 2. `AppHeader.tsx` — replace expand/collapse with mode props

Remove: `isExpanded`, `onToggleExpand`

Add: `mode?: "embedded" | "workspace"`, `onOpenWorkspace?`, `onExitWorkspace?`

- `"embedded"` → Maximize2 + "Open Workspace"
- `"workspace"` → Minimize2 + "Exit Workspace"
- Same styling, desktop-only visibility

### 3. `CalculatorLayout.tsx` — forward mode props

Replace `isExpanded`/`onToggleExpand` with `mode`/`onOpenWorkspace`/`onExitWorkspace`. Forward to `AppHeader`. Remove expand-related conditional classes. When `onOpenWorkspace` is provided, `CalculatorLayout` stashes the current draft state (via `useCalculatorState`) before calling the callback.

### 4. `ConcreteCalculator.tsx` — remove expand/collapse, add embedded mode

- Remove `isExpanded` state and all conditional hero/content hiding
- Always show all SEO content sections
- Pass `mode="embedded"` and `onOpenWorkspace` that navigates to `/app?tab=footing&from=/concrete-calculator`

### 5. Other SEO pages (4 files)

Each passes `mode="embedded"` and appropriate `onOpenWorkspace` handler. Minimal change per file — add `useNavigate` import + the callback prop.

### 6. `AppCalculator.tsx` — workspace mode + draft hydration

- Read `tab` and `from` from `useSearchParams`
- If `from` present, call `stashExitTarget(from)`
- Pass `mode="workspace"` and `onExitWorkspace` (uses `from` → `getExitTarget()` → `/concrete-calculator`)
- After mount, check `consumeDraft()`. If found, dispatch `LOAD` with handoff state. Otherwise respect existing state, then `tab` param as fallback for `SET_TAB`.

### 7. No changes to `CalculatorProvider` internals

Handoff uses existing `LOAD` dispatch mechanism from `AppCalculator`.

## Files changed

1. **New**: `src/lib/workspaceHandoff.ts`
2. `src/components/calculator/AppHeader.tsx`
3. `src/components/calculator/CalculatorLayout.tsx`
4. `src/pages/AppCalculator.tsx`
5. `src/pages/ConcreteCalculator.tsx`
6. `src/pages/ConcreteSlabCalculator.tsx`
7. `src/pages/ConcreteFootingCalculator.tsx`
8. `src/pages/ConcreteWallCalculator.tsx`
9. `src/pages/RebarCalculator.tsx`

## Unchanged

- Calculation logic, formulas, types
- SEO content sections
- Project save/load/export
- Mobile layout
- localStorage persistence for `/app` workspace state

