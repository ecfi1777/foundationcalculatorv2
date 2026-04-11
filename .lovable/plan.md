

# Unified Shell Structure for Calculator + Quantities Panels

## Problem
The left (calculator) and right (quantities) panes use different internal structures, causing their bottom edges to misalign. The form card wraps content in a bordered card with `mt-auto` for buttons, while the quantities panel uses its own flex layout. These are structurally different shells that can't reliably match.

## Approach
Apply an identical **shell pattern** to both panes:

```text
┌─────────────────────┐  ┌─────────────────────┐
│  flex flex-col       │  │  flex flex-col       │
│                      │  │                      │
│  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │ flex-1 min-h-0 │  │  │  │ flex-1 min-h-0 │  │
│  │ overflow-y-auto│  │  │  │ overflow-y-auto│  │
│  │  (form body)   │  │  │  │ (area list)    │  │
│  └────────────────┘  │  │  └────────────────┘  │
│  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │ shrink-0       │  │  │  │ shrink-0       │  │
│  │ border-t       │  │  │  │ border-t       │  │
│  │ (Save/Discard) │  │  │  │(Project Totals)│  │
│  └────────────────┘  │  │  └────────────────┘  │
└─────────────────────┘  └─────────────────────┘
```

## Changes

### 1. `src/components/calculator/CalculatorLayout.tsx` — Restructure left pane

**Current** (lines 413–425): The left column has a tab bar, then a scroll area containing a card that wraps the form + DraftActionButtons with `mt-auto`.

**New structure**:
- Outer: `flex-1 flex flex-col overflow-hidden` (same)
- Tab bar: stays at top, `shrink-0`
- Body: `flex-1 min-h-0 overflow-y-auto` — contains the form card with ActiveForm only (no DraftActionButtons inside)
- Footer: `shrink-0 border-t border-border` — DraftActionButtons rendered here, outside the scroll area, matching the quantities panel footer position

Remove the bordered card wrapper (`rounded-lg border bg-card p-4 flex flex-col h-full`) from around the form. Instead, apply padding directly to the scroll area content. This eliminates the nested flex-col that fights with the shell structure.

### 2. `src/components/calculator/QuantitiesPanel.tsx` — Add `shrink-0` to footer

The quantities panel already has the right structure. One small fix:
- Line 228: Add `shrink-0` to the Project Totals footer div so it matches the left pane's footer behavior exactly.

**Current**: `border-t border-border bg-card px-4 py-3 space-y-2`
**New**: `shrink-0 border-t border-border bg-card px-4 py-3 space-y-2`

### 3. `src/components/calculator/DraftActionButtons.tsx` — Remove outer margin

The `mt-4` on the wrapper div should become `py-3 px-4` to match the quantities panel footer padding, since it will now sit in a dedicated footer region rather than inside the form card.

### Files modified
- `src/components/calculator/CalculatorLayout.tsx` — restructure left pane into body/footer shell
- `src/components/calculator/QuantitiesPanel.tsx` — add `shrink-0` to footer
- `src/components/calculator/DraftActionButtons.tsx` — adjust padding to match footer region

### Unchanged
- Calculator logic, Workspace Mode, mobile layout, text copy
- QuantitiesPanel content and behavior
- ConcreteCalculator.tsx page wrapper (no changes needed — the shell fix is inside CalculatorLayout)

