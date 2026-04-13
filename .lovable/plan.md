

# Add redirects to `vercel.json`

## Single file: `vercel.json`

Replace the current contents with the exact JSON the user provided — keeping the existing `rewrites` unchanged and adding the new `redirects` array alongside it.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "foundationcalculatorv2.vercel.app"
        }
      ],
      "destination": "https://foundationcalculator.com/$1",
      "permanent": true
    }
  ]
}
```

No other files modified.

