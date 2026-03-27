import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { MeasurementRow } from "./MeasurementRow";
import { AreaSelector } from "./AreaSelector";

const FRAC_TO_NUM: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };
const NUM_TO_FRAC: Record<number, string> = { 0: "0", 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" };

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
          <MeasurementRow
            label="Diameter"
            feetValue={area.dimensions.diameterFt ?? 0}
            inchesValue={area.dimensions.diameterIn ?? 12}
            fractionValue={getFracStr(area.dimensions.diameterFrac)}
            onFeetChange={(v) => updateDim("diameterFt", v)}
            onInchesChange={(v) => updateDim("diameterIn", v)}
            onFractionChange={(v) => updateDim("diameterFrac", FRAC_TO_NUM[v] ?? 0)}
          />

          <MeasurementRow
            label="Height"
            feetValue={area.dimensions.heightFt ?? 4}
            inchesValue={area.dimensions.heightIn ?? 0}
            fractionValue={getFracStr(area.dimensions.heightFrac)}
            onFeetChange={(v) => updateDim("heightFt", v)}
            onInchesChange={(v) => updateDim("heightIn", v)}
            onFractionChange={(v) => updateDim("heightFrac", FRAC_TO_NUM[v] ?? 0)}
          />

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
