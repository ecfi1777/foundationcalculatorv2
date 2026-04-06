

# Update `index.html` Base-Level SEO

## Changes

### `index.html` — Two edits

**Edit 1**: Replace the `<title>` tag (currently "Lovable App") with:
```html
<title>Free Concrete Foundation Calculator | Instant Takeoff for Contractors</title>
```

**Edit 2**: Insert the specified meta/link tags immediately after the `<meta name="viewport">` line (before the theme script), and update the existing OG/Twitter tags already in the file:

New tags to add after viewport meta:
- `<meta name="description" ...>`
- `<meta name="robots" content="index, follow" />`
- `<meta property="og:title" ...>`
- `<meta property="og:description" ...>`
- `<meta property="og:type" content="website" />`
- `<meta property="og:url" content="https://foundationcalculator.com" />`
- `<meta property="og:site_name" content="Total Foundation Calculator" />`
- `<meta name="twitter:card" content="summary" />`
- `<meta name="twitter:title" ...>`
- `<meta name="twitter:description" ...>`
- `<link rel="canonical" href="https://foundationcalculator.com" />`

The existing duplicate/outdated OG and Twitter tags at the bottom of `<head>` (og:title, og:description, og:type, og:image, twitter:card, twitter:site, twitter:title, twitter:description, twitter:image, and the old `<meta name="description">` and `<meta name="author">`) will be removed to avoid conflicts.

### No other files modified

Single file change: `index.html`.

