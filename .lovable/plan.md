

# Fix: Separate Referral Attachment from Calculator Migration

## Problem
`attachReferralIfNeeded` needs to be extracted from `migrateAnonData` and called independently on every login/signup. It must be idempotent: no-op if a referral already exists for the user, and only clear the ref code after confirmed success or confirmed duplicate.

## Database
Add a unique index on `referrals.referred_user_id` to enforce one referral per user at the DB level. This also makes the idempotency check efficient.

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_user_id_unique
ON public.referrals (referred_user_id);
```

## Changes

### `src/lib/migrateAnonData.ts`

1. **Extract `attachReferralIfNeeded(userId: string)`** as a new exported async function:
   - Read `getRefCode()` from localStorage. If null, return immediately (nothing to do).
   - Check if a referral row already exists for this `referred_user_id`. If yes, clear the ref code from localStorage (confirmed no-op) and return.
   - Look up the affiliate by `referral_code`. If not found, clear the ref code (invalid code, no point retaining) and return.
   - Insert the referral row. If insert fails due to unique constraint violation (race condition), treat as no-op and clear the ref code. If insert fails for any other reason, do NOT clear the ref code (allow retry on next login).
   - On success, clear only the ref code key from localStorage (`localStorage.removeItem(REF_CODE_KEY)`). Do not call `clearAnonData()` here — that is the migration function's job.

2. **Remove the referral block (lines 112–126) from `migrateAnonData()`**. The `clearAnonData()` call at line 129 already removes the ref code key, so no change needed there.

### `src/lib/localStorage.ts`

Add a new export `clearRefCode()` that removes only the `REF_CODE_KEY`. This keeps the function granular — `attachReferralIfNeeded` should not clear promo codes or anon data flags.

### `src/pages/Auth.tsx`

Update the post-login effect (lines 31–38):

```typescript
useEffect(() => {
  if (!loading && user) {
    // Always attempt referral attachment, independent of anon data
    const postLogin = async () => {
      await attachReferralIfNeeded(user.id);
      if (hasAnonData()) {
        await migrateAnonData(user.id);
      }
      navigate("/");
    };
    postLogin();
  }
}, [user, loading, navigate]);
```

Import `attachReferralIfNeeded` from `@/lib/migrateAnonData`.

## Files Summary

| File | Change |
|------|--------|
| SQL migration | Add unique index on `referrals.referred_user_id` |
| `src/lib/localStorage.ts` | Add `clearRefCode()` export |
| `src/lib/migrateAnonData.ts` | Extract `attachReferralIfNeeded()`, remove referral block from `migrateAnonData()` |
| `src/pages/Auth.tsx` | Call `attachReferralIfNeeded()` on every login/signup before migration |

