import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { AreaSelector } from "./AreaSelector";

export function StepsForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("steps");
  const area = activeArea?.type === "steps" ? activeArea : null;

  const handleAdd = () => addArea("steps");

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
        type="steps"
      />

      {area && (
        <>
          <NumberField label="Number of Steps" value={area.dimensions.numSteps ?? 3} onChange={(v) => updateDim("numSteps", v)} min={1} />

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Rise" suffix="in" value={area.dimensions.riseIn ?? 7} onChange={(v) => updateDim("riseIn", v)} />
            <NumberField label="Run" suffix="in" value={area.dimensions.runIn ?? 11} onChange={(v) => updateDim("runIn", v)} />
            <NumberField label="Throat Depth" suffix="in" value={area.dimensions.throatDepthIn ?? 6} onChange={(v) => updateDim("throatDepthIn", v)} />
            <NumberField label="Width" suffix="in" value={area.dimensions.widthIn ?? 36} onChange={(v) => updateDim("widthIn", v)} />
            <NumberField label="Platform Depth" suffix="in" value={area.dimensions.platformDepthIn ?? 0} onChange={(v) => updateDim("platformDepthIn", v)} />
            <NumberField label="Platform Width" suffix="in" value={area.dimensions.platformWidthIn ?? 0} onChange={(v) => updateDim("platformWidthIn", v)} />
          </div>

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
