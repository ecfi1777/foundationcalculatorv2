

# Revised Plan: Restructure App into Homepage, /app, and SEO Pages

## Overview

Split the current homepage into a lightweight landing page (`/`), a pure calculator app (`/app`), and strengthen all placeholder SEO routes. No calculation logic, Supabase, or state management changes.

## Files to Create

### 1. `src/pages/AppCalculator.tsx` — Pure calculator at `/app`
- Current `Index.tsx` content (CalculatorProvider + ProjectProvider + CalculatorLayout)
- Keeps `captureRefCode()` and auth loading gate
- SEO with `noIndex: true`

### 2. `src/pages/Home.tsx` — Lightweight landing page at `/`
- **Hero**: "Concrete Calculator Built for Contractors", subtext, buttons → `/app` and `/concrete-calculator`
- **Calculator Links Grid**: Cards to `/concrete-calculator`, `/concrete-slab-calculator`, `/concrete-footing-calculator`, `/concrete-wall-calculator` — no rebar card
- **Why This Tool Exists**: Short paragraph
- **Contractor Benefits**: Bullets (multiple areas, save projects, feet & inches, export)
- **Trust Section**: Eastern Concrete Foundation
- **Screenshot Block**: `og-image.png` or styled placeholder
- **Final CTA** → `/app`

### 3. `src/pages/ConcreteSlabCalculator.tsx` — `/concrete-slab-calculator`
- SEO title/desc for slabs, H1, intro paragraph, calculator embed, example block, link to `/concrete-calculator`

### 4. `src/pages/ConcreteFootingCalculator.tsx` — `/concrete-footing-calculator`
- Same structure, tailored to footings

### 5. `src/pages/ConcreteWallCalculator.tsx` — `/concrete-wall-calculator`
- Same structure, tailored to walls

### 6. `src/pages/RebarCalculator.tsx` — `/rebar-calculator`
- Minimal "Coming soon" placeholder with SEO, H1, link to `/concrete-calculator`. No calculator embed.

## Files to Modify

### 7. `src/pages/Index.tsx`
- Replace with new Home landing page (or re-export from Home.tsx)

### 8. `src/App.tsx` — Add routes
- `/` → Home, `/app` → AppCalculator, plus slab/footing/wall/rebar routes. Existing routes unchanged.

### 9. `public/sitemap.xml` — Add new SEO routes only
Add entries for `/concrete-slab-calculator`, `/concrete-footing-calculator`, `/concrete-wall-calculator`, `/rebar-calculator`.

**Do NOT add `/app`** — it is `noIndex: true` and excluded from the sitemap.

## What Does NOT Change
- Calculator components, hooks, calculation logic, Supabase, auth, billing
- `src/pages/ConcreteCalculator.tsx` — untouched

