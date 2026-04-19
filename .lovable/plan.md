

# Consolidate anon-save onto auth-handoff path

## Two surgical edits

**1. `src/pages/Auth.tsx` (lines 84–98)** — Gate `migrateAnonData` behind `!peekAuthIntent()`. When intent is present, the canonical draft is in sessionStorage and `/app` will hydrate it. Skipping migration prevents the ghost "My Project" that consumes the free-tier slot and forces the resumed save into the paywall.

**2. `src/pages/AppCalculator.tsx` (`WorkspaceShell`, lines 22–69)** — After `consumeDraft` hydrates calculator state, call `consumeAuthIntent()` for authenticated mounts and translate `intent.action` into `setPendingAction({ type: intent.action })`. This re-arms the resume path that `ProjectProvider` lost when it unmounted across `/auth`. Adds imports for `consumeAuthIntent` and `useProject`.

Exact replacement code is in the user's prompt and will be applied verbatim.

## Out of scope (do NOT touch)
- `src/lib/migrateAnonData.ts`
- `src/components/calculator/CalculatorLayout.tsx` (including the dead `consumeAuthIntent` import on line 3)
- `src/hooks/useProject.tsx` (including the `isDraft` filter at line 336)
- `src/lib/authIntent.ts`, `src/lib/workspaceHandoff.ts`
- `SaveBanner.tsx`, `AccountCreationModal.tsx` (already correctly stash + set intent)

## Verification
1. Anon → add footing segment → Save → sign up → `/app` shows area + Quantities; exactly one project in DB after name modal; no ghost.
2. Same as (1) with login to existing account.
3. Direct `/auth` visit + populated `tfc_calculator_state` + no intent → legacy `migrateAnonData` still runs.
4. Direct `/auth` login, no anon data → no migration, lands on `/`.
5. Abandoned auth (back button) → existing `clearAuthIntent` cleanup still fires.
6. `consumeAuthIntent` called exactly once on resume, after handoff LOAD; sessionStorage key cleared.
7. Resumed save reaches the project name modal, NOT the paywall.

Known limitation (separate prompt): slabs/pier pads/cylinders/steps stay `isDraft: true` and `saveProject` line 336 still drops them. Footing flow works because `ADD_SEGMENT` auto-commits.

