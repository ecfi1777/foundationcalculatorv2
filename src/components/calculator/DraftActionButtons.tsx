import { useCalculatorState } from "@/hooks/useCalculatorState";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";

import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

/** Duplicate Save / Discard buttons rendered below the calculator form for mobile usability. */
export function DraftActionButtons() {
  const { activeArea, saveArea, dispatch, flushBeforeSave, flushPendingSegment } = useCalculatorState();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!activeArea?.isDraft) return null;

  const handleSave = () => {
    flushBeforeSave();
    const segmentFlushed = flushPendingSegment();
    if (segmentFlushed) {
      // ADD_SEGMENT auto-committed the area in the reducer (Prompt 1).
      // Calling saveArea here would read stale state and fail — skip it.
      toast.success("Area saved");
      dispatch({ type: "SET_ACTIVE_AREA", id: null });
      return;
    }
    const result = saveArea(activeArea.id);
    if (!result.valid) {
      toast.error(`Missing required fields: ${result.missingFields.join(", ")}`);
    } else {
      toast.success("Area saved");
      dispatch({ type: "SET_ACTIVE_AREA", id: null });
    }
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="flex gap-2 py-3 px-4">
        <Button className="flex-1 gap-1 h-9 text-sm" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Area
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-1 h-9 text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          Delete Area
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          dispatch({ type: "DELETE_AREA", id: activeArea.id });
          setConfirmOpen(false);
        }}
        title="Delete Area"
        description={`Are you sure you want to delete "${activeArea.name}"? All measurements will be permanently removed.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
