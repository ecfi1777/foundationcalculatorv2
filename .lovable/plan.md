

# Auto-save handoff work as "Untitled Project" on first authenticated mount

## Two file edits

**1. `src/pages/AppCalculator.tsx` — `WorkspaceShell`**
- Add `hasRequiredData` to the type-only import (convert to value import).
- Pull `state` from `useCalculatorState`; pull `currentProject`, `saveProject` from `useProject`.
- Add two refs: `hasAutoSavedHandoff` (one-shot guard) and `hydratedFromHandoff` (set synchronously inside the `if (handoff)` branch of the mount effect).
- Add a second effect, deps `[user, state.areas, currentProject, saveProject]`, that fires `saveProject("Untitled Project")` once when: authenticated, hydrated from handoff, no current project, ≥1 area passes `hasRequiredData`. Refs prevent re-fire across re-renders.

**2. `src/pages/Auth.tsx` — post-login effect**
- Drop the `migrateAnonData` branch entirely. Default `intent.redirectTo ?? "/app"` (was `"/"`).
- Trim imports: drop `migrateAnonData` (keep `attachReferralIfNeeded`), drop `hasAnonData` (keep `captureRefCode`).

## Why this is safe

- `saveProject` is the established first-save path used everywhere else (`SaveBanner`, header Save, `AccountCreationModal`). It correctly handles the Prompt 3 valid-draft filter, rebar configs, stone flags, and sets `currentProject`. Auto-save reuses it as-is — no new persistence code path.
- The two-effect split (synchronous LOAD dispatch in mount effect; auto-save in dep-tracked effect) correctly waits for React state to reflect the LOAD before saveProject's closure reads it.
- `hydratedFromHandoff` ref ensures auto-save only fires for handoff mounts — a logged-in user opening `/app` directly with no handoff never triggers it, even if they have areas in state from a previous session.
- `currentProject` short-circuit means the auto-save will not stomp an existing project (e.g., user with handoff mounts /app while already having a project loaded — `saveProject` would update, but `currentProject` guard skips entirely).
- `migrateAnonData.ts` stays untouched (archaeology). Its only call site was Auth.tsx; now unreachable but preserved.

## Behavioral contract

| Entry point | Auto-save | Project name | Active tab |
|---|---|---|---|
| Anon + work → header Sign In → login | Yes | Untitled Project | Matches handoff |
| Anon + work → header Save → signup | Yes | Untitled Project | Matches handoff |
| Anon + work → SaveBanner Sign Up | Yes | Untitled Project | Matches handoff |
| Anon + no work → Sign In | No | — | — |
| Anon + only invalid draft → Sign In | No | — (handoff visible only) | Matches handoff |
| Logged-in direct `/auth` login (no intent) | No | — | Lands on `/app` empty |
| Logged-in user clicks header Save (post-auto-save) | No (already has project) | — | — |

## Out of scope (do NOT touch)
- `src/lib/migrateAnonData.ts` (kept as archaeology)
- `src/lib/localStorage.ts` `hasAnonData` (still exported; other callers may exist)
- `src/hooks/useProject.tsx` (`saveProject`, `currentProject` restore effect)
- `src/hooks/useCalculatorState.tsx`
- `CalculatorLayout`, `SaveBanner`, `AccountCreationModal`
- `AppCalculator` outer component, `VALID_TABS`, provider composition
- All other `Auth.tsx` effects, state, handlers, UI

## Verification (per prompt's 12-item checklist)
1. Anon Slabs work + Sign In dropdown → Untitled Project in DB with project/area/section rows; correct active tab.
2. Anon Footings + header Save modal → same auto-save outcome.
3. Anon SaveBanner Sign Up → same.
4. Anon no-work Sign In → no project created.
5. Anon invalid-draft (Cylinders diameter only) → no project; handoff visible; manual Save works after filling fields.
6. Direct `/auth` login (no intent) → lands on `/app`, not `/`.
7. Logged-in normal Save flow → name modal still appears for first project.
8. Auto-save then add second area + header Save → no name modal, second area upserts into same project.
9. Pencil-rename Untitled Project → DB updates.
10. Abandoned `tfc_calculator_state` (no handoff, no intent) → no auto-save, no migration, lands `/app`.
11. Prompts 5/6/7 regressions clean (button visibility, snapshot revert, no auto-commit, edit-mode preserved).
12. No new TS errors; removed imports clean.

