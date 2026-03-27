import { Button } from "@/components/ui/button";
import type { CalcSection } from "@/types/calculator";
import { NumberField } from "./NumberField";
import { MeasurementRow } from "./MeasurementRow";
import { Trash2, Plus } from "lucide-react";

interface SectionEntryProps {
  sections: CalcSection[];
  sectionPrefix: string;
  showThickness?: boolean;
  showWaste?: boolean;
  showFractions?: boolean;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CalcSection>) => void;
  onDelete: (id: string) => void;
}

export function SectionEntry({
  sections,
  sectionPrefix,
  showThickness = false,
  showWaste = false,
  showFractions = false,
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

          {/* Length */}
          {showFractions ? (
            <MeasurementRow
              label="Length"
              feetValue={section.lengthFt}
              inchesValue={section.lengthIn}
              fractionValue={section.lengthFraction ?? "0"}
              onFeetChange={(v) => onUpdate(section.id, { lengthFt: v })}
              onInchesChange={(v) => onUpdate(section.id, { lengthIn: v })}
              onFractionChange={(v) => onUpdate(section.id, { lengthFraction: v })}
            />
          ) : (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Length</span>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="" suffix="ft" value={section.lengthFt} onChange={(v) => onUpdate(section.id, { lengthFt: v })} />
                <NumberField label="" suffix="in" value={section.lengthIn} onChange={(v) => onUpdate(section.id, { lengthIn: v })} />
              </div>
            </div>
          )}

          {/* Width */}
          {showFractions ? (
            <MeasurementRow
              label="Width"
              feetValue={section.widthFt}
              inchesValue={section.widthIn}
              fractionValue={section.widthFraction ?? "0"}
              onFeetChange={(v) => onUpdate(section.id, { widthFt: v })}
              onInchesChange={(v) => onUpdate(section.id, { widthIn: v })}
              onFractionChange={(v) => onUpdate(section.id, { widthFraction: v })}
            />
          ) : (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1 block">Width</span>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="" suffix="ft" value={section.widthFt} onChange={(v) => onUpdate(section.id, { widthFt: v })} />
                <NumberField label="" suffix="in" value={section.widthIn} onChange={(v) => onUpdate(section.id, { widthIn: v })} />
              </div>
            </div>
          )}

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
