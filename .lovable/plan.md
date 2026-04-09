

# Add Naming, Edit, and Delete Confirmation to TakeoffPanel

## Two files modified, no others touched.

### File 1: `src/components/seo/TakeoffPanel.tsx`

**Import changes:**
- Add `import { useState } from "react"`
- Add `Pencil` to lucide-react import
- Add `import { Input } from "@/components/ui/input"`

**Interface changes:**
- `TakeoffEntry`: add `name: string`, add `inputs: { slabL?, slabW?, slabT?, slabWaste?, footLf?, footW?, footD?, footWaste?, wallLf?, wallH?, wallT?, wallWaste?, rebarL?, rebarW?, rebarSpacing?, rebarWaste? }`
- `TakeoffPanelProps`: add `onEdit: (entry: TakeoffEntry) => void` and `onRename: (id: string, name: string) => void`

**Internal state:**
- Add `const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)`

**Entry card replacement (lines 67-115):**
Each entry card now has three sub-states:
1. **Delete confirmation** (when `pendingDeleteId === entry.id`): shows "Remove this item?" with entry name/label, Confirm (destructive) and Cancel buttons
2. **Normal display**: 
   - Row 0: always-visible name `<Input>` with placeholder "Name this area…"
   - Row 1: dimensions label + pencil button (calls `onEdit(entry)`) + trash button (sets `pendingDeleteId`)
   - Rows 2-3: base quantity + separator + with-waste quantity (unchanged logic)

### File 2: `src/pages/ConcreteCalculator.tsx`

**New state:** `const [editingId, setEditingId] = useState<string | null>(null)` (after line 39)

**New handlers** (after `handleClearEntries`):
- `handleEditEntry(entry)`: switches tab, pre-fills all form inputs from `entry.inputs`, sets `editingId`, scrolls to top on mobile
- `handleCancelEdit()`: clears `editingId` and `calculated`
- `handleRenameEntry(id, name)`: updates entry name in-place

**Rewrite `handleCalculate`:**
- Each branch adds `name: ""` and `inputs: { ... }` to the entry object
- Uses `editingId` as the id when editing (instead of generating new id)
- When `editingId` is set: replaces entry in-place preserving existing name, then clears `editingId`
- When `editingId` is null: appends as before

**JSX changes:**
- Button text: `editingId ? "Update Entry →" : "Add to Takeoff →"`
- Add "Cancel edit" button below when `editingId` is set
- Confirmation flash only shows when `!editingId`
- Both `<TakeoffPanel>` instances get `onEdit={handleEditEntry}` and `onRename={handleRenameEntry}` props

