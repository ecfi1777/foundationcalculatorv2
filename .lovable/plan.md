

# Hide team invite UI until team invites launch

## Single-file edit: `src/pages/Settings.tsx`

**1. Delete the Invite block** (~lines 460–473)
Remove the entire `{/* Invite */}` section: header "Invite Team Member", email `Input`, "Send Invite" `Button`, and wrapping div. Pending Invites block immediately below stays.

**2. Neutralize `handleSendInvite`** (lines 209–226)
Replace body with a no-op (keep the function signature so nothing crashes if referenced later). Add a comment explaining this is hidden until the feature ships and that re-enabling requires verifying Resend secrets for `add-seat`.

**3. Remove dead state**
Delete `inviteEmail` / `setInviteEmail` and `inviteLoading` / `setInviteLoading` (lines 48–49). Keep `invites` / `setInvites` — still used by the Pending Invites list.

## Out of scope (do NOT touch)
- Pending Invites list + `handleRevokeInvite` (existing invites stay revocable)
- Members list + Suspend
- All other Settings sections (account, billing, calculator preferences, org switcher)
- Every file under `supabase/functions/` (`add-seat`, `send-invite-email`, etc.)
- DB schema, RLS, types

## Verification
1. Settings → Team: no "Invite Team Member" label, no email input, no Send Invite button.
2. No stray UI path can trigger an invite.
3. Existing pending invites still render and Revoke still works.
4. Members list + Suspend unchanged.
5. Account / billing / calculator preferences / org switcher unchanged.
6. No TS errors; no unused imports left from removed state.
7. No diff under `supabase/functions/`.

