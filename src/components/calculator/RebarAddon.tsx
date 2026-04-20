import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumberField } from "./NumberField";
import { FieldInfoIcon } from "./FieldInfoIcon";
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
  /**
   * v2.3: whether to render the L-Bar sub-section. Pass true for
   * footings / walls / grade beams / pier pads per spec §8.12; false for curb.
   * Ignored in mode="slab". Defaults to false.
   */
  showLBar?: boolean;
}

// v2.3 spec §8.10 / §8.12 hold-down warning, shared by Vertical height and L-Bar vertical leg
const HOLD_DOWN_INFO_CONTENT =
  "Remember to account for any distance you're holding down from the top of the structure (e.g., 3\") when entering this value.";

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
  showLBar = false,
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
                <NumberField label="Inset" suffix="in" value={config.hInsetIn} onChange={(v) => onChange({ hInsetIn: v })} />
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
                <NumberField
                  label="Bar Height"
                  suffix="ft"
                  value={config.vBarHeightFt}
                  onChange={(v) => onChange({ vBarHeightFt: v })}
                  infoIcon={<FieldInfoIcon content={HOLD_DOWN_INFO_CONTENT} title="Bar Height Note" />}
                />
                <NumberField label="Bar Height" suffix="in" value={config.vBarHeightIn} onChange={(v) => onChange({ vBarHeightIn: v })} />
                <NumberField label="Overlap" suffix="in" value={config.vOverlapIn} onChange={(v) => onChange({ vOverlapIn: v })} />
                <NumberField label="Waste" suffix="%" value={config.vWastePct} onChange={(v) => onChange({ vWastePct: v })} />
              </div>
            )}
          </div>

          {/* L-Bar (v2.3 — gated by showLBar per spec §8.12 availability) */}
          {showLBar && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`lbar-rebar-${config.element_type}`}
                  checked={config.lbarEnabled}
                  onCheckedChange={(c) => onChange({ lbarEnabled: !!c })}
                />
                <Label htmlFor={`lbar-rebar-${config.element_type}`} className="text-sm">L-Bar Rebar</Label>
              </div>
              {config.lbarEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <BarSizeSelect value={config.lbarBarSize} onChange={(v) => onChange({ lbarBarSize: v })} />
                  <NumberField label="Spacing" suffix="in" value={config.lbarSpacingIn} onChange={(v) => onChange({ lbarSpacingIn: v })} min={1} />
                  <NumberField
                    label="Vertical"
                    suffix="ft"
                    value={config.lbarVerticalFt}
                    onChange={(v) => onChange({ lbarVerticalFt: v })}
                    infoIcon={<FieldInfoIcon content={HOLD_DOWN_INFO_CONTENT} title="Vertical Leg Note" />}
                  />
                  <NumberField label="Vertical" suffix="in" value={config.lbarVerticalIn} onChange={(v) => onChange({ lbarVerticalIn: v })} />
                  <NumberField label="Bend Length" suffix="in" value={config.lbarBendLengthIn} onChange={(v) => onChange({ lbarBendLengthIn: v })} />
                  <NumberField label="Overlap" suffix="in" value={config.lbarOverlapIn} onChange={(v) => onChange({ lbarOverlapIn: v })} />
                  <NumberField label="Inset" suffix="in" value={config.lbarInsetIn} onChange={(v) => onChange({ lbarInsetIn: v })} />
                  <NumberField label="Waste" suffix="%" value={config.lbarWastePct} onChange={(v) => onChange({ lbarWastePct: v })} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {enabled && mode === "slab" && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <BarSizeSelect value={config.gridBarSize} onChange={(v) => onChange({ gridBarSize: v })} />
          <NumberField label="Spacing" suffix="in" value={config.gridSpacingIn} onChange={(v) => onChange({ gridSpacingIn: v })} min={1} />
          <NumberField label="Overlap" suffix="in" value={config.gridOverlapIn} onChange={(v) => onChange({ gridOverlapIn: v })} />
          <NumberField label="Inset" suffix="in" value={config.gridInsetIn} onChange={(v) => onChange({ gridInsetIn: v })} />
          <NumberField label="Waste" suffix="%" value={config.gridWastePct} onChange={(v) => onChange({ gridWastePct: v })} />
        </div>
      )}
    </div>
  );
}
