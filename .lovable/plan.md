

# Wire Up Per-Page SEO Meta Tags

## Current State
- `react-helmet-async` already installed (v3.0.0) and `HelmetProvider` already wraps the app in `App.tsx` (line 23). Steps 1 and 2 are done.
- `HowItWorks.tsx` already uses `<Helmet>` directly with its own SEO logic — this will be left as-is since it has dynamic slug-based title/description handling.
- No `/privacy` or `/terms` pages or routes exist yet. Those pages would need to be created to add SEO to them, but that's outside the stated scope ("Do not modify any routing logic"). I will skip those two for now.

## Changes

### 1. Create `src/components/SEO.tsx`
New file with the specified interface. Renders `<Helmet>` with title suffix, description, canonical, and robots meta.

### 2. Add `<SEO>` to each existing page (7 files)

| Page | File | noIndex |
|------|------|---------|
| `/` | `Index.tsx` | no |
| `/auth` | `Auth.tsx` | yes |
| `/settings` | `Settings.tsx` | yes |
| `/admin` | `Admin.tsx` | yes |
| `/affiliate` | `AffiliateDashboard.tsx` | yes |
| `/upgrade` | `UpgradeRedirect.tsx` | no |
| `/reset-password` | `ResetPassword.tsx` | yes (not in spec but should be noIndex) |

### Not touched
- **`HowItWorks.tsx`** — already has its own `<Helmet>` with dynamic SEO; adding the `<SEO>` component would conflict with its existing logic.
- **`/privacy`, `/terms`** — pages and routes don't exist yet. Creating them would require adding routes, which violates the "do not modify routing logic" rule. These can be added when the pages are created.
- **`NotFound.tsx`** — will add `noIndex={true}` SEO tag.

### Files modified
| File | Change |
|------|--------|
| `src/components/SEO.tsx` | New file |
| `src/pages/Index.tsx` | Add `<SEO>` import + tag |
| `src/pages/Auth.tsx` | Add `<SEO>` import + tag |
| `src/pages/Settings.tsx` | Add `<SEO>` import + tag |
| `src/pages/Admin.tsx` | Add `<SEO>` import + tag |
| `src/pages/AffiliateDashboard.tsx` | Add `<SEO>` import + tag |
| `src/pages/UpgradeRedirect.tsx` | Add `<SEO>` import + tag |
| `src/pages/ResetPassword.tsx` | Add `<SEO>` import + tag |
| `src/pages/NotFound.tsx` | Add `<SEO>` import + tag |

No routing, calculation, layout, or provider changes.

