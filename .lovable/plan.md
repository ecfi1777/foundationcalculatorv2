

## Fix: Update RLS policy on `projects` table to allow soft-delete

### Root Cause
The current UPDATE policy on `projects` has a `WITH CHECK` that blocks setting `deleted_at` — the exact `WITH CHECK` expression needs to only validate org membership, not row visibility constraints like `deleted_at IS NULL`.

### Confirmed
- **`org_id` is immutable** in practice — it is only set during `INSERT` and never modified in any update path across the codebase. The `WITH CHECK (is_org_member(auth.uid(), org_id))` clause is safe because `org_id` won't change.
- **Explicit `WITH CHECK` is preferred** over relying on USING fallback semantics, for clarity and future-proofing.

### Database Migration

Drop and recreate the UPDATE policy with an explicit, clean `WITH CHECK` that only checks org membership:

```sql
DROP POLICY IF EXISTS "Members can update org projects" ON public.projects;

CREATE POLICY "Members can update org projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));
```

This allows soft-delete (setting `deleted_at = now()`) because the new row still belongs to the same org. The SELECT policy continues to hide soft-deleted rows via its `deleted_at IS NULL` filter.

### No Frontend Changes
The existing `deleteProject()` in `useProject.tsx` already performs the correct `.update({ deleted_at, updated_at })` call.

### What This Preserves
- Free-tier save limits (enforced in `CalculatorLayout.tsx`)
- Soft-delete visibility filtering (SELECT policy unchanged)
- All other project CRUD behavior

