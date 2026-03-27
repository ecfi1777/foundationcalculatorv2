import { useCalculatorState } from "@/hooks/useCalculatorState";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import { hasRequiredData } from "@/types/calculator";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

/** Duplicate Save / Discard buttons rendered below the calculator form for mobile usability. */
export function DraftActionButtons() {
  const { activeArea, saveArea, dispatch, flushBeforeSave } = useCalculatorState();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!activeArea?.isDraft) return null;

  const handleSave = () => {
    flushBeforeSave();
    const result = saveArea(activeArea.id);
    if (!result.valid) {
      toast.error(`Missing required fields: ${result.missingFields.join(", ")}`);
    } else {
      toast.success("Area saved");
      dispatch({ type: "SET_ACTIVE_AREA", id: null });
    }
  };

  const handleDiscard = () => {
    if (hasRequiredData(activeArea)) {
      setConfirmOpen(true);
    } else {
      dispatch({ type: "DELETE_AREA", id: activeArea.id });
    }
  };

  return (
    <>
      <div className="flex gap-2 pt-2">
        <Button className="flex-1 gap-1" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Area
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleDiscard}
        >
          <Trash2 className="h-4 w-4" />
          Discard Area
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          dispatch({ type: "DELETE_AREA", id: activeArea.id });
          setConfirmOpen(false);
        }}
        title="Discard Area"
        description={`Are you sure you want to discard "${activeArea.name}"? All measurements will be permanently removed.`}
        confirmLabel="Discard"
        variant="destructive"
      />
    </>
  );
}
