

# Create `vercel.json` for SPA Routing

## Note
Lovable hosting already handles SPA routing automatically — this file only takes effect if the project is deployed to Vercel separately.

## Change

### Create `vercel.json` (project root)
Single new file with the exact rewrite rule specified:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

No other files modified.

