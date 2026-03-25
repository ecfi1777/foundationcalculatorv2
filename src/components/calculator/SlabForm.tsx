import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SectionEntry } from "./SectionEntry";
import { RebarAddon } from "./RebarAddon";
import { StoneBaseAddon } from "./StoneBaseAddon";
import { AreaSelector } from "./AreaSelector";
import type { CalcSection } from "@/types/calculator";
import { makeDefaultRebar } from "@/types/calculator";
import { generateId } from "@/lib/utils";

export function SlabForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("slab");
  const area = activeArea?.type === "slab" ? activeArea : null;

  const handleAdd = (customName?: string) => {
    const area = addArea("slab");
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const addSection = () => {
    if (!area) return;
    const num = area.sections.length + 1;
    const section: CalcSection = {
      id: generateId(),
      name: `Slab Section (${num})`,
      lengthFt: 0,
      lengthIn: 0,
      widthFt: 0,
      widthIn: 0,
      thicknessIn: 4,
      wastePct: 0,
      includeStone: false,
      stoneDepthIn: 4,
      stoneTypeId: "57stone",
      sortOrder: num,
    };
    dispatch({ type: "ADD_SECTION", areaId: area.id, section });
  };

  const rebarConfig = area?.rebarConfigs?.slab ?? makeDefaultRebar("slab");
  const rebarEnabled = rebarConfig.gridEnabled;

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        onDiscard={(id) => dispatch({ type: "DELETE_AREA", id })}
        onRename={(id, name) => dispatch({ type: "RENAME_AREA", id, name })}
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
            onAdd={addSection}
            onUpdate={(id, patch) => dispatch({ type: "UPDATE_SECTION", areaId: area.id, sectionId: id, patch })}
            onDelete={(id) => dispatch({ type: "DELETE_SECTION", areaId: area.id, sectionId: id })}
          />

          <RebarAddon
            enabled={rebarEnabled}
            config={rebarConfig}
            onToggle={(v) => {
              dispatch({
                type: "UPDATE_REBAR",
                areaId: area.id,
                elementType: "slab",
                rebar: { gridEnabled: v },
              });
            }}
            onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, elementType: "slab", rebar: patch })}
            mode="slab"
            sectionLabel="Add Rebar Grid"
          />

          <StoneBaseAddon
            enabled={area.stoneEnabled ?? false}
            depthIn={area.stoneDepthIn ?? 4}
            stoneTypeId={area.stoneTypeId ?? "57stone"}
            onToggle={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { stoneEnabled: v } })}
            onChange={(patch) => dispatch({ type: "UPDATE_AREA", id: area.id, patch })}
          />
        </>
      )}
    </div>
  );
}
