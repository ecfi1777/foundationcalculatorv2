

# Fix Slab Export Volume Calculation

## Problem
Line 81 in `buildExportData.ts` double-applies waste by multiplying `volumeCy` (pre-waste) by `area.wastePct`. The correct value `volumeWithWasteCy` (already waste-adjusted by `calcSlabSection`) is available but unused.

## Change — `src/lib/export/buildExportData.ts`
**Line 81**: Replace `slabResult.volumeCy * (1 + area.wastePct / 100)` with `slabResult.volumeWithWasteCy`

Single line change. No other files modified.

