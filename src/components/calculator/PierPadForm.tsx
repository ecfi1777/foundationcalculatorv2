import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SectionEntry } from "./SectionEntry";
import { AreaSelector } from "./AreaSelector";
import { RebarAddon } from "./RebarAddon";
import type { CalcSection } from "@/types/calculator";
import { makeDefaultRebar } from "@/types/calculator";
import { generateId } from "@/lib/utils";

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
      id: generateId(),
      name: `Pier Pad Section (${num})`,
      lengthFt: 0,
      lengthIn: 0,
      lengthFraction: "0",
      widthFt: 0,
      widthIn: 0,
      widthFraction: "0",
      thicknessIn: 0,
      wastePct: 0,
      includeStone: false,
      stoneDepthIn: 0,
      stoneTypeId: "57stone",
      sortOrder: num,
    };
    dispatch({ type: "ADD_SECTION", areaId: area.id, section });
  };

  // v2.3: Pier pad rebar is L-Bar only per spec §8.12. Element_type = "pier_pad".
  const pierPadRebar = area?.rebarConfigs?.pier_pad ?? makeDefaultRebar("pier_pad");
  const rebarEnabled = pierPadRebar.lbarEnabled;

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        onDiscard={(id) => dispatch({ type: "DELETE_AREA", id })}
        onRename={(id, name) => dispatch({ type: "RENAME_AREA", id, name })}
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
            showFractions
            onAdd={addSection}
            onUpdate={(id, patch) => dispatch({ type: "UPDATE_SECTION", areaId: area.id, sectionId: id, patch })}
            onDelete={(id) => dispatch({ type: "DELETE_SECTION", areaId: area.id, sectionId: id })}
          />

          <RebarAddon
            enabled={rebarEnabled}
            config={pierPadRebar}
            onToggle={(v) =>
              dispatch({
                type: "UPDATE_REBAR",
                areaId: area.id,
                elementType: "pier_pad",
                rebar: { lbarEnabled: v },
              })
            }
            onChange={(patch) =>
              dispatch({
                type: "UPDATE_REBAR",
                areaId: area.id,
                elementType: "pier_pad",
                rebar: patch,
              })
            }
            mode="lbar_only"
            sectionLabel="Add Rebar"
          />
        </>
      )}
    </div>
  );
}
