

# Migrate SEO Takeoff to Supabase After Auth

## Overview
After sign-in, if `tfc_seo_takeoff` exists in localStorage, create a "My Takeoff" project in Supabase with areas/sections/segments for each entry. Clear the key regardless of outcome.

## Verification: localStorage.ts
`hasSeoTakeoff()` and `clearSeoTakeoff()` already exist. `saveSeoTakeoff` has the `if (entries.length === 0) return;` guard. **No changes needed.**

## File 1: `src/lib/migrateSeoTakeoff.ts` (CREATE)
New file implementing `migrateSeoTakeoff(userId: string)`:
- Reads and immediately clears `tfc_seo_takeoff` from localStorage
- Parses entries, filters to slab/footing/wall only
- Fetches user's `active_org_id` from `user_settings`
- Creates one project named "My Takeoff"
- For each entry: creates an area row with correct `calculator_type` (`slab`, `footings`, `walls`) and `inputs` payload, then:
  - Slab: inserts a section with length/width/thickness
  - Footing/Wall: inserts a segment with feet/inches/fraction
- Skips entries with zero dimensions
- Logs errors via `console.error`, continues on failure

## File 2: `src/pages/Auth.tsx` (MODIFY)
- Add `hasSeoTakeoff` to the localStorage import
- Add `import { migrateSeoTakeoff } from "@/lib/migrateSeoTakeoff"`
- In `postLogin`, after the `migrateAnonData` block, add:
  ```ts
  if (hasSeoTakeoff()) {
    await migrateSeoTakeoff(user.id);
  }
  ```
- `navigate("/")` remains the last line

## Safety
- No changes to `localStorage.ts` or `migrateAnonData.ts`
- No changes to any component files
- Existing `attachReferralIfNeeded` and `migrateAnonData` calls untouched

