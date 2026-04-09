

# Update vercel.json destination

## Change
Replace the contents of `vercel.json` so the rewrite destination is `/index.html` instead of `/200.html`.

## File: `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

No other files modified.

