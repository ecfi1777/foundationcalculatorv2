

# Fix Post-Save Empty State

## Root Cause

After "Save Area", `DraftActionButtons` dispatches `SET_ACTIVE_AREA(null)`. This makes `activeArea` null, which causes:

1. **`DraftActionButtons`** returns `null` (line 14: `if (!activeArea?.isDraft) return null`)
2. **Form components** (e.g. `FootingForm` line 99) guard all inputs behind `{area && (...)}`, so nothing renders below the `AreaSelector`
3. **`AreaSelector`** shows the saved-areas dropdown or "No footing areas" text, but has **no "Add New Area" button** — the `onAdd` prop is accepted but never wired to any visible UI element

The user lands on a tab showing only a dropdown (or empty label) with no way to start a new area.

## Fix

**Single file changed: `src/components/calculator/AreaSelector.tsx`**

Add a visible "+ New Area" button that calls `onAdd()`. Show it whenever the user is **not** currently editing a draft — i.e., when `activeAreaId` is null or points to a saved area. This covers:

- Post-save state (no active area)
- Browsing saved areas (can start a new one)

When a draft is active, the button is hidden (the user should save/discard first).

Additionally, when there are no saved areas **and** no active draft, show a clear empty-state message with the button as the primary CTA:

```
No footing areas yet.
[ + New Footing Area ]
```

When there **are** saved areas but no active area, show the dropdown alongside the button:

```
[ Select area… ▾ ]  [ + New Area ]
```

### Technical detail

- The `onAdd` prop already exists on `AreaSelector` — it just needs a `<Button>` wired to it
- No logic changes to forms, reducer, or `DraftActionButtons`
- The button calls `onAdd()` with no arguments (each form's `handleAdd` generates the default name)
- Use a small `outline` variant button with a `Plus` icon to stay visually consistent

