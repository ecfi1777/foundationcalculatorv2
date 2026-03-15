import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberField } from "./NumberField";
import type { RebarConfig, BarSize } from "@/types/calculator";
import { BAR_SIZES } from "@/types/calculator";

interface RebarAddonProps {
  enabled: boolean;
  config: RebarConfig;
  onToggle: (v: boolean) => void;
  onChange: (patch: Partial<RebarConfig>) => void;
  mode: "linear" | "slab";
  /** Label for the section, e.g. "Footing Rebar" or "Wall Rebar" */
  sectionLabel?: string;
  /** Label for vertical rebar, "Dowels" for footings, "Vertical" for walls */
  verticalLabel?: string;
}

function BarSizeSelect({ value, onChange }: { value: BarSize; onChange: (v: BarSize) => void }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">Bar Size</Label>
      <Select value={value} onValueChange={(v) => onChange(v as BarSize)}>
        <SelectTrigger className="mt-1 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BAR_SIZES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function RebarAddon({
  enabled,
  config,
  onToggle,
  onChange,
  mode,
  sectionLabel = "Add Rebar",
  verticalLabel = "Vertical Rebar",
}: RebarAddonProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`rebar-toggle-${config.element_type}`}
          checked={enabled}
          onCheckedChange={(c) => onToggle(!!c)}
        />
        <Label htmlFor={`rebar-toggle-${config.element_type}`} className="text-sm font-medium">
          {sectionLabel}
        </Label>
      </div>

      {enabled && mode === "linear" && (
        <div className="space-y-4 pt-1">
          {/* Horizontal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`h-rebar-${config.element_type}`}
                checked={config.hEnabled}
                onCheckedChange={(c) => onChange({ hEnabled: !!c })}
              />
              <Label htmlFor={`h-rebar-${config.element_type}`} className="text-sm">Horizontal Rebar</Label>
            </div>
            {config.hEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <BarSizeSelect value={config.hBarSize} onChange={(v) => onChange({ hBarSize: v })} />
                <NumberField label="Rows" value={config.hNumRows} onChange={(v) => onChange({ hNumRows: v })} min={1} />
                <NumberField label="Overlap" suffix="in" value={config.hOverlapIn} onChange={(v) => onChange({ hOverlapIn: v })} />
                <NumberField label="Waste" suffix="%" value={config.hWastePct} onChange={(v) => onChange({ hWastePct: v })} />
              </div>
            )}
          </div>

          {/* Vertical */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`v-rebar-${config.element_type}`}
                checked={config.vEnabled}
                onCheckedChange={(c) => onChange({ vEnabled: !!c })}
              />
              <Label htmlFor={`v-rebar-${config.element_type}`} className="text-sm">{verticalLabel}</Label>
            </div>
            {config.vEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <BarSizeSelect value={config.vBarSize} onChange={(v) => onChange({ vBarSize: v })} />
                <NumberField label="Spacing" suffix="in" value={config.vSpacingIn} onChange={(v) => onChange({ vSpacingIn: v })} min={1} />
                <NumberField label="Bar Height" suffix="ft" value={config.vBarHeightFt} onChange={(v) => onChange({ vBarHeightFt: v })} />
                <NumberField label="Bar Height" suffix="in" value={config.vBarHeightIn} onChange={(v) => onChange({ vBarHeightIn: v })} />
                <NumberField label="Overlap" suffix="in" value={config.vOverlapIn} onChange={(v) => onChange({ vOverlapIn: v })} />
                <NumberField label="Waste" suffix="%" value={config.vWastePct} onChange={(v) => onChange({ vWastePct: v })} />
              </div>
            )}
          </div>
        </div>
      )}

      {enabled && mode === "slab" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <BarSizeSelect value={config.gridBarSize} onChange={(v) => onChange({ gridBarSize: v })} />
          <NumberField label="Spacing" suffix="in" value={config.gridSpacingIn} onChange={(v) => onChange({ gridSpacingIn: v })} min={1} />
          <NumberField label="Overlap" suffix="in" value={config.gridOverlapIn} onChange={(v) => onChange({ gridOverlapIn: v })} />
          <NumberField label="Waste" suffix="%" value={config.gridWastePct} onChange={(v) => onChange({ gridWastePct: v })} />
        </div>
      )}
    </div>
  );
}
