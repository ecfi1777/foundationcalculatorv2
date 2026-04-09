

# Add Per-Route OG Tags to SEO Component

## Scope
One file: `src/components/SEO.tsx`

## Change
Replace the entire file with the user-provided version that adds Open Graph meta tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:site_name`) to the existing `<Helmet>` block. These tags override the static values in `index.html` on a per-route basis, ensuring social crawlers and Googlebot see correct metadata for each page.

Constants `SITE_NAME`, `SITE_URL`, and `OG_IMAGE` are extracted to the top of the file. The `canonicalUrl` includes an SSR-safe fallback (`typeof window !== "undefined"` check).

