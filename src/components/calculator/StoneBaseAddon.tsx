import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberField } from "./NumberField";

interface StoneBaseAddonProps {
  enabled: boolean;
  depthIn: number;
  stoneTypeId: string;
  onToggle: (v: boolean) => void;
  onChange: (patch: { stoneDepthIn?: number; stoneTypeId?: string }) => void;
}

export function StoneBaseAddon({
  enabled,
  depthIn,
  stoneTypeId,
  onToggle,
  onChange,
}: StoneBaseAddonProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="stone-base-toggle"
          checked={enabled}
          onCheckedChange={(c) => onToggle(!!c)}
        />
        <Label htmlFor="stone-base-toggle" className="text-sm font-medium">
          Add Stone Base
        </Label>
      </div>

      {enabled && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <NumberField
            label="Stone Depth"
            suffix="in"
            value={depthIn}
            onChange={(v) => onChange({ stoneDepthIn: v })}
          />
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Stone Type</Label>
            <Select
              value={stoneTypeId}
              onValueChange={(v) => onChange({ stoneTypeId: v })}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="57stone">Crushed #57 Stone (3/4 in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
