

# Fix: Unsaved-changes warning fires on empty state

## Problem
`isDirty` becomes true on `ADD_AREA` dispatch (before any measurements are entered), triggering the "unsaved changes" warning when the user hasn't entered anything worth preserving.

## Changes

### File 1 — `src/components/calculator/CalculatorLayout.tsx`

1. **Add import** (after line 30): `import { hasRequiredData } from "@/types/calculator";`
   - Note: contrary to the prompt, there is no existing import from `@/types/calculator` in this file, so a new import line is needed.

2. **Compute `hasSubstantiveData`** (after line 84, alongside `hasAreas`/`canExport`):
   ```ts
   const hasSubstantiveData =
     !!currentProject ||
     state.areas.some((area) => hasRequiredData(area));
   ```

3. **Update `handleNewProject` guard** (line 141): Change `if (isDirty)` → `if (isDirty && hasSubstantiveData)`

4. **Add to `headerProps`** (around line 248): Add `hasSubstantiveData,` to the object

### File 2 — `src/components/calculator/AppHeader.tsx`

1. **Add to interface** (after line 30): `hasSubstantiveData: boolean;`

2. **Destructure** (line 43): Add `hasSubstantiveData` alongside `isDirty`

3. **Update logo onClick** (line 59): Change `if (!isDirty)` → `if (!isDirty || !hasSubstantiveData)`

No other files modified.

