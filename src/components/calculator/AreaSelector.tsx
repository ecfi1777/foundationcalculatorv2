import { Button } from "@/components/ui/button";
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
          onClick={() => onAdd()}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Area
        </Button>
      </div>
    </div>
  );
}
