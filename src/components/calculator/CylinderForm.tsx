import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { AreaSelector } from "./AreaSelector";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FRACTION_OPTIONS = [
  { label: "0", value: "0", num: 0 },
  { label: "1/4", value: "1/4", num: 0.25 },
  { label: "1/2", value: "1/2", num: 0.5 },
  { label: "3/4", value: "3/4", num: 0.75 },
] as const;

const NUM_TO_FRAC: Record<number, string> = { 0: "0", 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" };
const FRAC_TO_NUM: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };

function getFracStr(val: number | undefined): string {
  if (val === undefined) return "0";
  return NUM_TO_FRAC[val] ?? "0";
}

export function CylinderForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("cylinder");
  const area = activeArea?.type === "cylinder" ? activeArea : null;

  const handleAdd = (customName?: string) => {
    const area = addArea("cylinder");
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        onDiscard={(id) => dispatch({ type: "DELETE_AREA", id })}
        onRename={(id, name) => dispatch({ type: "RENAME_AREA", id, name })}
        type="cylinder"
      />

      {area && (
        <>
          {/* Diameter: ft / in / fraction */}
          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Diameter</span>
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                label=""
                suffix="ft"
                value={area.dimensions.diameterFt ?? 0}
                onChange={(v) => updateDim("diameterFt", v)}
              />
              <NumberField
                label=""
                suffix="in"
                value={area.dimensions.diameterIn ?? 12}
                onChange={(v) => updateDim("diameterIn", v)}
              />
              <div>
                <Select
                  value={getFracStr(area.dimensions.diameterFrac)}
                  onValueChange={(v) => updateDim("diameterFrac", FRAC_TO_NUM[v] ?? 0)}
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

          {/* Height: ft / in / fraction */}
          <div>
            <span className="text-xs text-muted-foreground mb-1 block">Height</span>
            <div className="grid grid-cols-3 gap-2">
              <NumberField
                label=""
                suffix="ft"
                value={area.dimensions.heightFt ?? 4}
                onChange={(v) => updateDim("heightFt", v)}
              />
              <NumberField
                label=""
                suffix="in"
                value={area.dimensions.heightIn ?? 0}
                onChange={(v) => updateDim("heightIn", v)}
              />
              <div>
                <Select
                  value={getFracStr(area.dimensions.heightFrac)}
                  onValueChange={(v) => updateDim("heightFrac", FRAC_TO_NUM[v] ?? 0)}
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

          <NumberField label="Quantity" value={area.dimensions.quantity ?? 1} onChange={(v) => updateDim("quantity", v)} min={1} />

          <NumberField
            label="Waste"
            suffix="%"
            value={area.wastePct}
            onChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: v } })}
          />
        </>
      )}
    </div>
  );
}
