

# Add react-snap Prerendering Configuration

## Scope
Two files only: `package.json` and `vercel.json`

## Changes

### 1. `package.json` — Three additions

**1A. Add `postbuild` script** (after line 8, the `"build"` line):
```
"postbuild": "react-snap"
```

**1B. Add `react-snap` to `devDependencies`** (after line 92):
```
"react-snap": "^1.23.0"
```

**1C. Add top-level `reactSnap` config key** (after `devDependencies` closes, before the final `}`):
```json
"reactSnap": {
  "puppeteerArgs": ["--no-sandbox", "--disable-setuid-sandbox"],
  "include": [
    "/",
    "/how-it-works",
    "/how-it-works/footings",
    "/how-it-works/walls",
    "/how-it-works/slabs",
    "/how-it-works/slab-rebar",
    "/how-it-works/wall-rebar",
    "/how-it-works/l-bars",
    "/how-it-works/grade-beams",
    "/how-it-works/pier-pads",
    "/how-it-works/curbs",
    "/how-it-works/stone-base",
    "/how-it-works/concrete-totals"
  ],
  "skipThirdPartyRequests": true,
  "minifyHtml": false
}
```

### 2. `vercel.json` — Change destination

Replace `"/index.html"` with `"/200.html"` so Vercel serves prerendered HTML for known routes and falls back to `200.html` for SPA routes.

### Post-deploy note
A fresh Vercel deployment is needed after these changes for `postbuild` to run and generate the static HTML files.

