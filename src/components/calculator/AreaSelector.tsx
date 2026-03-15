import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalcArea, CalculatorType } from "@/types/calculator";
import { Plus } from "lucide-react";

interface AreaSelectorProps {
  areas: CalcArea[];
  activeAreaId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  type: CalculatorType;
}

export function AreaSelector({ areas, activeAreaId, onSelect, onAdd }: AreaSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {areas.length > 0 ? (
        <Select value={activeAreaId ?? ""} onValueChange={onSelect}>
          <SelectTrigger className="h-9 flex-1">
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
        <span className="flex-1 text-sm text-muted-foreground">No areas yet</span>
      )}
      <Button size="sm" variant="outline" onClick={onAdd} className="h-9 gap-1">
        <Plus className="h-3.5 w-3.5" />
        Add Area
      </Button>
    </div>
  );
}
