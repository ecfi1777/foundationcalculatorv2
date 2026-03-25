import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CalcSection } from "@/types/calculator";
import { NumberField } from "./NumberField";
import { Trash2, Plus } from "lucide-react";

interface SectionEntryProps {
  sections: CalcSection[];
  sectionPrefix: string; // "Slab Section" | "Pier Pad Section"
  showThickness?: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CalcSection>) => void;
  onDelete: (id: string) => void;
}

export function SectionEntry({
  sections,
  sectionPrefix,
  showThickness = false,
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
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={onAdd} className="gap-1">
        <Plus className="h-3.5 w-3.5" />
        Add Section
      </Button>
    </div>
  );
}
