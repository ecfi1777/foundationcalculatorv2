import { useState } from "react";
import { useProject } from "@/hooks/useProject";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import type { CalcArea, CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS, hasRequiredData } from "@/types/calculator";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InlineNameEditor } from "./InlineNameEditor";

interface AreaSelectorProps {
  areas: CalcArea[];
  activeAreaId: string | null;
  onSelect: (id: string) => void;
  onAdd: (customName?: string) => void;
  onDiscard?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  type: CalculatorType;
}

export function AreaSelector({ areas, activeAreaId, onSelect, onAdd, onDiscard, onRename, type }: AreaSelectorProps) {
  const { saveArea, dispatch } = useCalculatorState();
  const typeLabel = CALCULATOR_LABELS[type]?.toLowerCase() ?? type;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeArea = areas.find((a) => a.id === activeAreaId);
  const savedAreas = areas.filter((a) => !a.isDraft);

  const handleSelect = (id: string) => {
    if (id === activeAreaId) return;
    onSelect(id);
  };

  const handleSaveArea = () => {
    if (!activeAreaId) return;
    const result = saveArea(activeAreaId);
    if (!result.valid) {
      toast.error(`Missing required fields: ${result.missingFields.join(", ")}`);
    } else {
      toast.success("Area saved");
      dispatch({ type: "SET_ACTIVE_AREA", id: null });
    }
  };

  const handleDiscardArea = () => {
    if (!activeAreaId) return;
    if (activeArea?.isDraft && hasRequiredData(activeArea)) {
      setConfirmOpen(true);
    } else {
      dispatch({ type: "DELETE_AREA", id: activeAreaId });
    }
  };

  const confirmDiscard = () => {
    if (activeAreaId) {
      dispatch({ type: "DELETE_AREA", id: activeAreaId });
    }
    setConfirmOpen(false);
  };

  const handleRename = (newName: string) => {
    if (activeAreaId && onRename) {
      onRename(activeAreaId, newName);
    }
  };

  return (
    <div className="flex flex-col border-b border-border bg-card/50">
      <div className="flex items-center gap-2 px-3 py-2">
        {activeArea?.isDraft ? (
          <div className="flex-1 min-w-0">
            <InlineNameEditor
              name={activeArea.name}
              onRename={handleRename}
            />
          </div>
        ) : savedAreas.length > 0 ? (
          <Select value={activeAreaId ?? ""} onValueChange={handleSelect}>
            <SelectTrigger className="h-9 flex-1 bg-secondary/50">
              <SelectValue placeholder="Select area…" />
            </SelectTrigger>
            <SelectContent>
              {savedAreas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">No {typeLabel} areas</span>
        )}

      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDiscard}
        title="Discard Area"
        description={`Are you sure you want to discard "${activeArea?.name ?? "this area"}"? All measurements will be permanently removed.`}
        confirmLabel="Discard"
        variant="destructive"
      />
    </div>
  );
}
