import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { AreaSelector } from "./AreaSelector";

export function CylinderForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("cylinder");
  const area = activeArea?.type === "cylinder" ? activeArea : null;

  const handleAdd = () => addArea("cylinder");

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
        type="cylinder"
      />

      {area && (
        <>
          <NumberField label="Diameter" suffix="in" value={area.dimensions.diameterIn ?? 12} onChange={(v) => updateDim("diameterIn", v)} />

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Height" suffix="ft" value={area.dimensions.heightFt ?? 4} onChange={(v) => updateDim("heightFt", v)} />
            <NumberField label="Height" suffix="in" value={area.dimensions.heightIn ?? 0} onChange={(v) => updateDim("heightIn", v)} />
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
