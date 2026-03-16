

## Complete RLS Policy Audit on `public.projects`

### 1. Current Policy Set (confirmed via live database query)

| Command | Policy Name | Permissive | USING (old row) | WITH CHECK (new row) |
|---------|------------|------------|-----------------|---------------------|
| **SELECT** | Members can read org projects | Yes | `is_org_member(auth.uid(), org_id) AND (deleted_at IS NULL)` | — |
| **INSERT** | Members can create org projects | Yes | — | `is_org_member(auth.uid(), org_id)` |
| **UPDATE** | Members can update org projects | Yes | `is_org_member(auth.uid(), org_id)` | `is_org_member(auth.uid(), org_id)` |
| **DELETE** | Owners can delete org projects | Yes | `is_org_owner(auth.uid(), org_id)` | — |

No restrictive policies. No additional SELECT or UPDATE policies. One trigger exists: `update_projects_updated_at` (sets `updated_at = now()` before update — harmless). No CHECK constraints beyond PK and FK to `organizations`.

### 2. The UPDATE policy is already correct

The migration from the previous message **was applied successfully**. The UPDATE policy now has:
- USING: `is_org_member(auth.uid(), org_id)` — no `deleted_at` check
- WITH CHECK: `is_org_member(auth.uid(), org_id)` — no `deleted_at` check

This means the soft-delete update (`SET deleted_at = now()`) should pass both the USING and WITH CHECK clauses, since `org_id` does not change and the user is a confirmed org member.

### 3. Exact SQL being executed

From `src/hooks/useProject.tsx` line 466-470:

```typescript
const { error } = await supabase
  .from("projects")
  .update({ deleted_at: timestamp, updated_at: timestamp })
  .eq("id", id)
  .is("deleted_at", null);
```

This translates to:
```sql
UPDATE projects
SET deleted_at = '...', updated_at = '...'
WHERE id = '<project_id>' AND deleted_at IS NULL;
```

### 4. PostgreSQL RLS evaluation for this UPDATE

For the old row (pre-update):
- **SELECT USING**: `is_org_member(...) AND deleted_at IS NULL` → **passes** (row is active, user is member)
- **UPDATE USING**: `is_org_member(...)` → **passes**

For the new row (post-update):
- **UPDATE WITH CHECK**: `is_org_member(...)` → **passes** (org_id unchanged)

PostgreSQL does NOT apply SELECT policies to the new row for UPDATE operations. Only the UPDATE WITH CHECK is applied to the new row. Therefore **the current policy set should allow soft-delete without any further changes.**

### 5. Key finding: the fix may already be working

The only PATCH request in the network logs is from `03:25:40Z`. The migration was created at `03:23:56Z` but may not have been fully deployed by then. All subsequent network activity (03:26 through 03:36) consists only of GET requests — no further delete attempts.

**The user may not have retried the delete after the migration was fully applied.**

### Recommended next step

No additional policy changes are needed. The user should retry deleting a project in the preview to confirm the migration resolved the issue. The SELECT policy correctly hides soft-deleted rows, and the UPDATE policy correctly allows the soft-delete mutation.

If the delete still fails after retry, we would need to inspect the exact new error response to diagnose further — but based on the current policy configuration, it should succeed.

