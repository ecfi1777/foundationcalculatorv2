import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { CalcArea, CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS } from "@/types/calculator";
import { Plus } from "lucide-react";

interface AreaSelectorProps {
  areas: CalcArea[];
  activeAreaId: string | null;
  onSelect: (id: string) => void;
  onAdd: (customName?: string) => void;
  type: CalculatorType;
}

export function AreaSelector({ areas, activeAreaId, onSelect, onAdd, type }: AreaSelectorProps) {
  const typeLabel = CALCULATOR_LABELS[type]?.toLowerCase() ?? type;
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    onAdd(trimmed || undefined);
    setNewName("");
    setShowNameInput(false);
  };

  return (
    <div className="flex flex-col border-b border-border bg-card/50">
      <div className="flex items-center gap-2 px-3 py-2">
        {areas.length > 0 ? (
          <Select value={activeAreaId ?? ""} onValueChange={onSelect}>
            <SelectTrigger className="h-9 flex-1 bg-secondary/50">
              <SelectValue placeholder="Select area…" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="flex-1 text-sm text-muted-foreground">No {typeLabel} areas</span>
        )}
        <Button
          size="sm"
          className="h-9 gap-1"
          onClick={() => {
            if (showNameInput) {
              handleAdd();
            } else {
              setShowNameInput(true);
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Area
        </Button>
      </div>
      {showNameInput && (
        <div className="flex items-center gap-2 px-3 pb-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowNameInput(false);
                setNewName("");
              }
            }}
            autoFocus
            placeholder={`e.g. ${CALCULATOR_LABELS[type] ?? type} Area name (optional)`}
            className="h-8 text-sm flex-1"
          />
          <Button size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={handleAdd}>
            Create
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={() => { setShowNameInput(false); setNewName(""); }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
