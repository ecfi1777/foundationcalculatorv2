

# Phase 13 — "How Calculations Work" Page

## Overview

Build a static, SEO-optimized documentation page at `/how-it-works` (and `/how-it-works/:sectionSlug`) explaining every calculator's formula. Pure static content, no DB queries, no auth required.

## New dependency

Install `react-helmet-async`. Wrap `<HelmetProvider>` around the app in `App.tsx`.

## Files to create

### 1. `src/data/calculatorHowItWorksData.ts` — shared content source

Single array of section objects, each containing:
- `slug` (e.g. `"footings"`, `"walls"`, `"rebar-linear"`, `"stone-base"`)
- `title`, `seoTitle`, `description` (plain English)
- `inputs` — list of `{ name, description }` 
- `formula` — readable math string
- `diagramAlt` — placeholder label
- `workedExample` — `{ inputs, steps, result }` object

All 11 calculator sections plus the Global Rules section. Formulas taken directly from the existing calculation source files (`footing.ts`, `wall.ts`, `gradeBeam.ts`, `curbGutter.ts`, `slab.ts`, `pierPad.ts`, `cylinder.ts`, `steps.ts`, `rebar.ts`, `stoneBase.ts`).

Also includes the FAQ data array (6 Q&A pairs).

### 2. `src/pages/HowItWorks.tsx` — page component

- Reads `sectionSlug` from `useParams()`
- If slug provided, filters to that section; otherwise shows all
- `<Helmet>` with dynamic title/description per section or main page defaults
- Renders `<GlobalRulesSection>` (only on main page or no slug)
- Maps over filtered sections rendering `<CalculatorSection>` for each
- Renders `<FAQSection>` at bottom
- JSON-LD `FAQPage` structured data via `<Helmet>` script tag

### 3. `src/components/how-it-works/GlobalRulesSection.tsx`

Card with the global rules content (cubic yards, waste %, units, rebar defaults).

### 4. `src/components/how-it-works/CalculatorSection.tsx`

Reusable component receiving one section data object. Renders:
- H2 title with `id={slug}` for anchor links
- Plain English description
- Inputs list
- Formula in a styled code/math block
- Diagram placeholder (gray dashed box)
- Worked example in a card

Steps/Stairs section includes "Spike VM slope-adjusted method" label.

### 5. `src/components/how-it-works/FAQSection.tsx`

Renders Q&A pairs using accordion or simple disclosure pattern.

### 6. `src/components/how-it-works/SectionNav.tsx`

- Desktop: sticky sidebar table of contents with anchor links
- Mobile: dropdown `<Select>` for section navigation

### 7. `src/components/calculator/AppFooter.tsx`

Simple footer with three links: How Calculations Work (`/how-it-works`), Privacy (`/privacy`), Terms (`/terms`).

## Files to modify

### `App.tsx`
- Import `HelmetProvider` from `react-helmet-async`, wrap app
- Add routes: `/how-it-works` and `/how-it-works/:sectionSlug` → `<HowItWorks />`

### `src/components/calculator/AppHeader.tsx`
- Wire the existing `HelpCircle` button (line 172-174) `onClick` to `navigate("/how-it-works")`

### `src/components/calculator/CalculatorLayout.tsx`
- Add `<AppFooter />` at the bottom of both mobile and desktop layouts

### `src/pages/Settings.tsx`
- Add a "Help & Documentation" card with a link to `/how-it-works` after the Calculator Preferences section

## Worked example content (Footings)

**Inputs**: Linear Feet = 100, Width = 24 in, Depth = 12 in  
**Formula**: `100 × (24 ÷ 12) × (12 ÷ 12) ÷ 27 ≈ 7.41 yd³`

Similar worked examples for all 11 sections, derived from the actual formula implementations.

## Section slugs

`footings`, `walls`, `grade-beams`, `curb-gutter`, `slabs`, `pier-pads`, `cylinders`, `steps-stairs`, `rebar-linear`, `rebar-grid`, `stone-base`

## Layout

Desktop: two-column — sticky nav sidebar (left, ~200px) + content (right, max-w-3xl). Mobile: dropdown nav at top, single column content.

Uses `@tailwindcss/typography` (already in devDependencies) for prose styling on content sections. All shadcn/ui components (Card, Separator, Badge, Select for mobile nav).

