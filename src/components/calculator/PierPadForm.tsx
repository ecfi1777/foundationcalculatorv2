import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SectionEntry } from "./SectionEntry";
import { AreaSelector } from "./AreaSelector";
import type { CalcSection } from "@/types/calculator";

export function PierPadForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("pierPad");
  const area = activeArea?.type === "pierPad" ? activeArea : null;

  const handleAdd = (customName?: string) => {
    const area = addArea("pierPad");
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  const addSection = () => {
    if (!area) return;
    const num = area.sections.length + 1;
    const section: CalcSection = {
      id: crypto.randomUUID(),
      name: `Pier Pad Section (${num})`,
      lengthFt: 0,
      lengthIn: 0,
      widthFt: 0,
      widthIn: 0,
      thicknessIn: 0,
      includeStone: false,
      stoneDepthIn: 0,
      stoneTypeId: "57stone",
      sortOrder: num,
    };
    dispatch({ type: "ADD_SECTION", areaId: area.id, section });
  };

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        type="pierPad"
      />

      {area && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Depth" suffix="in" value={area.dimensions.depthIn ?? 6} onChange={(v) => updateDim("depthIn", v)} />
            <NumberField label="Quantity" value={area.dimensions.quantity ?? 1} onChange={(v) => updateDim("quantity", v)} min={1} />
          </div>

          <NumberField
            label="Waste"
            suffix="%"
            value={area.wastePct}
            onChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: v } })}
          />

          <SectionEntry
            sections={area.sections}
            sectionPrefix="Pier Pad Section"
            showThickness={false}
            showStone={false}
            onAdd={addSection}
            onUpdate={(id, patch) => dispatch({ type: "UPDATE_SECTION", areaId: area.id, sectionId: id, patch })}
            onDelete={(id) => dispatch({ type: "DELETE_SECTION", areaId: area.id, sectionId: id })}
          />
        </>
      )}
    </div>
  );
}
