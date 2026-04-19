

# Preserve calculator state across /auth redirect

## Root cause

`CalculatorProvider` already persists to `localStorage` (`tfc_calculator_state`) and rehydrates on remount, so most state would survive `/auth`. **But** `migrateLoadedState` (useCalculatorState.tsx lines 257-266) **unconditionally discards every `isDraft` area** on load. Anonymous users clicking Save almost always have only a draft area (auto-provisioned, never explicitly committed via "Save Area"). After auth round-trip → provider remounts → draft gets dropped → save resumes against empty state.

## Fix: piggyback on existing `workspaceHandoff` pattern

The `stashDraft` / `consumeDraft` pair in `src/lib/workspaceHandoff.ts` already implements exactly the sessionStorage handoff we need, and `WorkspaceShell` in `AppCalculator.tsx` already consumes it on mount via `dispatch({ type: "LOAD", state: handoff })`. The `LOAD` action restores state verbatim — no draft filtering — so drafts survive.

So we just need to **stash before redirecting to /auth** and let the existing consume path do the rest.

## Changes

### 1. `src/components/calculator/CalculatorLayout.tsx`

In `handleSave` and `handleNewProject`, before `setShowAccountModal(true)`, snapshot current state:
```ts
stashDraft(state); // existing import already present at line 2
```
That's it for save/new-project entry points.

### 2. `src/components/project/AccountCreationModal.tsx`

The "Create Free Account" CTA navigates to `/auth`. Pull `state` from `useCalculatorState()` and call `stashDraft(state)` immediately before `navigate("/auth")` (alongside the existing `setAuthIntent` call).

### 3. `src/components/calculator/SaveBanner.tsx`

Same — pull `state` from `useCalculatorState()` and `stashDraft(state)` before `navigate("/auth")` in `handleSignUp`.

### 4. `src/pages/AppCalculator.tsx` — **no change needed**

`WorkspaceShell` already calls `consumeDraft<CalcState>()` on mount and dispatches `LOAD` (lines 41-46). The handoff path runs whether the user came from an SEO page or from `/auth`. The existing `LOAD` reducer case (line 200-201) replaces state verbatim, preserving drafts.

### 5. Order of operations on return

`WorkspaceShell` mount: `consumeDraft` runs first (line 41), then `CalculatorLayout` mounts and its existing effect (line 117) sees `user && pendingAction` and resumes save against the now-restored state. ✅

## What we deliberately do NOT change

- Calculator reducer / migration logic (drafts still get discarded on plain localStorage reload — that's intentional cross-session behavior).
- Database / server persistence — anonymous users still write nothing to the server.
- Auth intent system — already correct.
- OAuth flow — Google redirects back to `/auth`, which navigates to `/app`, which mounts `WorkspaceShell` and consumes the draft. Same path as email signup.

## Files changed

1. `src/components/calculator/CalculatorLayout.tsx` — add `stashDraft(state)` in `handleSave` and `handleNewProject` (anonymous branches only).
2. `src/components/project/AccountCreationModal.tsx` — `stashDraft(state)` before navigate.
3. `src/components/calculator/SaveBanner.tsx` — `stashDraft(state)` before navigate.

## Verification

1. Anonymous → add areas (drafts + committed) → Save → AccountCreationModal → "Create Free Account" → email signup → confirm → land on `/app` → all areas restored exactly → save modal opens automatically.
2. Same flow via Google OAuth.
3. Same flow via login (existing user).
4. Anonymous → Save → "Maybe later" on modal → state still in `localStorage` (handoff was stashed but not consumed; sessionStorage entry harmlessly evicted on next `/app` mount via `consumeDraft`).
5. Anonymous → click Save banner X → no stash, no intent, no regression.
6. Authenticated user save flows — `stashDraft` not invoked (anonymous-only branches), no behavior change.

