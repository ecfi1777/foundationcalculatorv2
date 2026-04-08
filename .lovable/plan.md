

# Fix: Persist Effect Race Condition in useProject.tsx

## Problem
The persist `useEffect` and restore `useEffect` both run on mount. The persist effect runs first (declared first), sees `currentProject` as `null`, and calls `localStorage.removeItem(PROJECT_KEY)` — deleting the saved project before the restore effect can read it.

## Change — `src/hooks/useProject.tsx`

**Single block replacement** (~lines 177–185): Remove the `else { localStorage.removeItem(PROJECT_KEY) }` branch from the persist effect. Deletion is already handled explicitly in `resetToBlankInternal` and `clearAllState`.

No other files modified.

