

# Wire header Sign In through auth handoff + remove dead import

## Two file edits

**1. `src/components/calculator/AppHeader.tsx`**
- Add optional `onSignIn?: () => void` to `AppHeaderProps` (after `onSignOut`).
- Destructure `onSignIn` in the function signature.
- Update the Sign In `DropdownMenuItem` (line ~247): call `onSignIn()` if provided, else fall back to existing `navigate("/auth")`.

**2. `src/components/calculator/CalculatorLayout.tsx`**
- Remove dead `consumeAuthIntent` from the import on line 3 (keep `setAuthIntent`).
- Add `handleSignIn` callback alongside `handleNewProject`: `stashDraft(state)` + `setAuthIntent({ redirectTo: "/app" })` + `navigate("/auth")`. No `pendingAction` (Sign In ≠ save/newProject).
- Pass `onSignIn: handleSignIn` in the `headerProps` object.

`navigate` and `stashDraft` are already imported/in-scope in `CalculatorLayout` — no new imports needed beyond trimming `consumeAuthIntent`.

## Out of scope (do NOT touch)
- `src/lib/authIntent.ts`, `src/lib/workspaceHandoff.ts`
- `src/pages/Auth.tsx` (its `if (!intent && hasAnonData())` gate naturally skips migration once intent is set)
- `src/pages/AppCalculator.tsx` / `WorkspaceShell` (already consumes handoff)
- `src/lib/migrateAnonData.ts` (separate tracked concern; traffic drops near-zero)
- `SaveBanner.tsx`, `AccountCreationModal.tsx` (handoff template, untouched)
- Reducer, `DraftActionButtons`, `useProject`
- `onSignIn` stays optional with `navigate("/auth")` fallback so `AppHeader` is reusable outside `CalculatorLayout`

## Verification (per prompt's 7-item list)
1. Anon + work → header Sign In → signup → returns to `/app` with footing/segments intact, no "My Project" ghost.
2. Anon + no work → Sign In → lands on `/app` empty, no migration, no ghost project.
3. Direct `/auth` URL with anon localStorage → legacy `migrateAnonData` still fires (untouched fallback).
4. SaveBanner Sign Up + header Save modal still work end-to-end.
5. Logged-in dropdown shows only Sign Out (Sign In hidden).
6. No TS errors, `consumeAuthIntent` import gone from `CalculatorLayout.tsx`.
7. Prompt 7 draft behavior intact (build, Save Area, pencil-edit, add segment, Save).

