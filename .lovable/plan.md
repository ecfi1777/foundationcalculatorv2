

# Fix sign-out: navigate home AND clear in-memory state

## Problem

Two issues remain after Prompt A (the persistence guard):

1. **No navigation on sign-out** — `onAuthStateChange` fires `SIGNED_OUT` but nothing calls `navigate('/')`, so the user stays on the current route.
2. **In-memory state survives** — `CalculatorProvider` wraps `Index`, not `App`. Navigating to `/` doesn't destroy the component tree, so areas and quantities remain in React state.

## Architecture constraint

`AuthProvider` lives in `App.tsx` (above routes). `CalculatorProvider` lives inside `Index.tsx`. So `useAuth` **cannot** call `useCalculatorState` directly — they're at different levels of the tree.

However, `useProject` (inside `Index.tsx`) already imports **both** `useAuth` and `useCalculatorState`, and already has a `clearAllState()` that dispatches `RESET`.

## Plan — two files

### File 1: `src/hooks/useAuth.tsx`
- Import `useNavigate` from `react-router-dom`
- In the `onAuthStateChange` callback, when `_event === 'SIGNED_OUT'`, call `navigate('/')`
- This handles navigation only — auth layer doesn't touch calculator state

### File 2: `src/hooks/useProject.tsx`
- Add a `useEffect` that watches `user` (from `useAuth`)
- When `user` becomes `null`, call `clearAllState()` to dispatch `RESET`, clear projects, subscription tier, and pending actions
- This reactively clears all in-memory state regardless of how sign-out happens (button click, session expiry, another tab)

### Sign-out sequence

```text
1. supabase fires SIGNED_OUT event
2. useAuth: sets user=null, calls navigate('/')
3. useProject useEffect: sees user=null → calls clearAllState()
   → dispatches RESET (clears areas from memory)
   → clears projects, tier, pending action
4. Persistence effect (Prompt A): sees areas.length===0 → removes localStorage key
```

### Why not put RESET in useAuth directly?

`useAuth` is above `CalculatorProvider` in the component tree — it has no access to the calculator dispatch. Moving `CalculatorProvider` up to `App.tsx` would work but changes the architecture unnecessarily. The reactive `useEffect` in `useProject` is the minimal, clean approach — it already has access to both `user` and `dispatch`.

