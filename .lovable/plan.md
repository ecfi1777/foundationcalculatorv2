

# Phase 7b — RebarAddon UI: Inset inputs + info icons + L-Bar section

UI-only commit. Adds Inset inputs, an ⓘ hold-down warning, and a new L-Bar sub-section. Builds on 7a's types + persistence; no schema/server/Quantities/export changes.

## Files (6)

### 1. `src/components/calculator/FieldInfoIcon.tsx` — NEW
Generic field-level info icon. Tooltip on desktop, Dialog on mobile (uses `useIsMobile`). Separate from existing `InfoIcon.tsx` (Phase 13 calc-diagram scaffold — leave alone).

### 2. `src/components/calculator/NumberField.tsx`
Add optional `infoIcon?: ReactNode` prop, rendered inline next to the label. No call-site changes required.

### 3. `src/components/calculator/RebarAddon.tsx`
- Import `FieldInfoIcon`.
- Add `showLBar?: boolean` prop (default `false`).
- Define shared §8.10/§8.12 hold-down warning string.
- **Horizontal**: insert `Inset (in)` field between Overlap and Waste → bound to `hInsetIn`.
- **Vertical**: attach `<FieldInfoIcon>` to `Bar Height (ft)` label. NO Inset field (Finding 8b).
- **L-Bar (NEW)**: gated by `showLBar` + `mode==="linear"`. Sub-checkbox + 8 fields in order: Bar Size, Spacing, Vertical (ft) with ⓘ, Vertical (in), Bend Length, Overlap, Inset, Waste.
- **Slab grid**: insert `Inset (in)` between Overlap and Waste → bound to `gridInsetIn`.
- Keep `BarSizeSelect` helper byte-identical.
- Outer toggle dispatch shape unchanged (pre-existing behavior).

### 4. `src/components/calculator/FootingForm.tsx`
- Update `footingRebarEnabled` and `wallRebarEnabled` to OR `lbarEnabled`.
- Add `showLBar` to both `RebarAddon` calls (footing + wall).

### 5. `src/components/calculator/LinearForm.tsx`
- Update `rebarEnabled` to OR `lbarEnabled`.
- Add `showLBar` to `RebarAddon` call (covers Wall standalone + Grade Beam).

### 6. `src/components/calculator/CurbGutterForm.tsx`
- Update `rebarEnabled` to OR `lbarEnabled` (defensive only — no `showLBar` per spec §8.12).

## Out of scope
- `InfoIcon.tsx`, `SlabForm.tsx`, `PierPadForm.tsx` (7c), `recalculate-project` (7d), QuantitiesPanel/exports (7d), Settings (Phase 10), HowItWorks (Phase 13), schema/types (done in 7a), tests (35/35 stay green).
- V section gets no Inset field (persists as default 3 from 7a).
- Outer "Add Rebar" toggle quirk (unchanged).

## Verification
1. Build clean, 35/35 tests pass, no console errors.
2. Footing H rebar shows: Bar Size, Rows, Overlap, Inset (=3), Waste. Persists across reload.
3. Vertical "Bar Height (ft)" has ⓘ → tooltip/dialog with v2.3 hold-down text. V section has exactly 6 fields, no Inset.
4. L-Bar visible on Footing/Wall/Grade Beam: 8 fields with `Bend Length=12`, `Inset=3` defaults; ⓘ on Vertical (ft).
5. L-Bar absent on Curb, Slab, Pier Pad.
6. Slab grid shows Inset field (=3).
7. DB round-trip: `h_inset_in=5, lbar_enabled=true, lbar_vertical_ft=4, lbar_bend_length_in=12, lbar_inset_in=2`.
8. Mobile (≤768px): 2-col grid intact, ⓘ opens Dialog.

