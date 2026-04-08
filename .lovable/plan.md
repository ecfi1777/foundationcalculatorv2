

# Confirmation: `exportDisabled` is already correct

Line 51 of `AppHeader.tsx`:
```ts
const exportDisabled = !canExport || isExporting;
```

This covers both conditions:
- `!canExport` → disabled when no project is saved
- `isExporting` → disabled while an export is in progress

The plan to move the export buttons out of the dropdown will reuse this same `exportDisabled` variable on the new standalone buttons. No adjustment needed.

