import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SectionEntry } from "./SectionEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import type { CalcSection } from "@/types/calculator";

export function SlabForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("slab");
  const area = activeArea?.type === "slab" ? activeArea : null;

  const handleAdd = () => addArea("slab");

  const addSection = () => {
    if (!area) return;
    const num = area.sections.length + 1;
    const section: CalcSection = {
      id: crypto.randomUUID(),
      name: `Slab Section (${num})`,
      lengthFt: 0,
      lengthIn: 0,
      widthFt: 0,
      widthIn: 0,
      thicknessIn: 4,
      includeStone: false,
      stoneDepthIn: 4,
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
        type="slab"
      />

      {area && (
        <>
          <NumberField
            label="Waste"
            suffix="%"
            value={area.wastePct}
            onChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: v } })}
          />

          <SectionEntry
            sections={area.sections}
            sectionPrefix="Slab Section"
            showThickness
            showStone
            onAdd={addSection}
            onUpdate={(id, patch) => dispatch({ type: "UPDATE_SECTION", areaId: area.id, sectionId: id, patch })}
            onDelete={(id) => dispatch({ type: "DELETE_SECTION", areaId: area.id, sectionId: id })}
          />

          <RebarAddon
            enabled={area.rebarEnabled}
            config={area.rebar}
            onToggle={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { rebarEnabled: v } })}
            onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, rebar: patch })}
            mode="slab"
          />
        </>
      )}
    </div>
  );
}
