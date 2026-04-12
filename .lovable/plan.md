

# Update Homepage Hero CTA

## Single edit in `src/pages/Home.tsx`

**Lines 59–66**: Replace the two-button div with a single CTA button:

```tsx
<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
  <Button asChild size="lg">
    <Link to="/app">Start Calculating</Link>
  </Button>
</div>
```

Changes:
- Remove "View Calculator" outline button entirely
- Change "Start Calculator" → "Start Calculating"
- Keep same wrapper div, link target, and button styling

No other files or sections modified.

