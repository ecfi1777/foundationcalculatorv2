import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalcSection } from "@/types/calculator";
import { NumberField } from "./NumberField";
import { Trash2, Plus } from "lucide-react";

interface SectionEntryProps {
  sections: CalcSection[];
  sectionPrefix: string; // "Slab Section" | "Pier Pad Section"
  showThickness?: boolean;
  showStone?: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CalcSection>) => void;
  onDelete: (id: string) => void;
}

export function SectionEntry({
  sections,
  sectionPrefix,
  showThickness = false,
  showStone = false,
  onAdd,
  onUpdate,
  onDelete,
}: SectionEntryProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{section.name}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(section.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Length"
              suffix="ft"
              value={section.lengthFt}
              onChange={(v) => onUpdate(section.id, { lengthFt: v })}
            />
            <NumberField
              label="Length"
              suffix="in"
              value={section.lengthIn}
              onChange={(v) => onUpdate(section.id, { lengthIn: v })}
            />
            <NumberField
              label="Width"
              suffix="ft"
              value={section.widthFt}
              onChange={(v) => onUpdate(section.id, { widthFt: v })}
            />
            <NumberField
              label="Width"
              suffix="in"
              value={section.widthIn}
              onChange={(v) => onUpdate(section.id, { widthIn: v })}
            />
          </div>

          {showThickness && (
            <NumberField
              label="Thickness"
              suffix="in"
              value={section.thicknessIn}
              onChange={(v) => onUpdate(section.id, { thicknessIn: v })}
            />
          )}

          {showStone && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`stone-${section.id}`}
                  checked={section.includeStone}
                  onCheckedChange={(c) => onUpdate(section.id, { includeStone: !!c })}
                />
                <Label htmlFor={`stone-${section.id}`} className="text-sm">
                  Stone Base
                </Label>
              </div>
              {section.includeStone && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <NumberField
                    label="Stone Depth"
                    suffix="in"
                    value={section.stoneDepthIn}
                    onChange={(v) => onUpdate(section.id, { stoneDepthIn: v })}
                  />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Stone Type</Label>
                    <Select
                      value={section.stoneTypeId || "57stone"}
                      onValueChange={(v) => onUpdate(section.id, { stoneTypeId: v })}
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
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        Add Section
      </Button>
    </div>
  );
}
