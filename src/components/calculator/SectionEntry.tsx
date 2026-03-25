import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CalcSection } from "@/types/calculator";
import { NumberField } from "./NumberField";
import { Trash2, Plus } from "lucide-react";

const FRACTION_OPTIONS = [
  { label: "0", value: "0" },
  { label: "1/4", value: "1/4" },
  { label: "1/2", value: "1/2" },
  { label: "3/4", value: "3/4" },
] as const;

interface SectionEntryProps {
  sections: CalcSection[];
  sectionPrefix: string;
  showThickness?: boolean;
  showWaste?: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CalcSection>) => void;
  onDelete: (id: string) => void;
}

export function SectionEntry({
  sections,
  sectionPrefix,
  showThickness = false,
  showWaste = false,
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

          {/* Length: ft / in / fraction */}
          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Length</span>
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                label=""
                suffix="ft"
                value={section.lengthFt}
                onChange={(v) => onUpdate(section.id, { lengthFt: v })}
              />
              <NumberField
                label=""
                suffix="in"
                value={section.lengthIn}
                onChange={(v) => onUpdate(section.id, { lengthIn: v })}
              />
              <div>
                <Select
                  value={section.lengthFraction ?? "0"}
                  onValueChange={(v) => onUpdate(section.id, { lengthFraction: v })}
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRACTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}"</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Width: ft / in / fraction */}
          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Width</span>
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                label=""
                suffix="ft"
                value={section.widthFt}
                onChange={(v) => onUpdate(section.id, { widthFt: v })}
              />
              <NumberField
                label=""
                suffix="in"
                value={section.widthIn}
                onChange={(v) => onUpdate(section.id, { widthIn: v })}
              />
              <div>
                <Select
                  value={section.widthFraction ?? "0"}
                  onValueChange={(v) => onUpdate(section.id, { widthFraction: v })}
                >
                  <SelectTrigger className="h-9 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRACTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}"</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {showThickness && (
            <div className={showWaste ? "grid grid-cols-2 gap-3" : ""}>
              <NumberField
                label="Thickness"
                suffix="in"
                value={section.thicknessIn}
                onChange={(v) => onUpdate(section.id, { thicknessIn: v })}
              />
              {showWaste && (
                <NumberField
                  label="Waste"
                  suffix="%"
                  value={section.wastePct}
                  onChange={(v) => onUpdate(section.id, { wastePct: v })}
                />
              )}
            </div>
          )}
          {!showThickness && showWaste && (
            <NumberField
              label="Waste"
              suffix="%"
              value={section.wastePct}
              onChange={(v) => onUpdate(section.id, { wastePct: v })}
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
