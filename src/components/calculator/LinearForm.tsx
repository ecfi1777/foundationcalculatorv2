import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { calcTypeToElementType, makeDefaultRebar } from "@/types/calculator";
import type { RebarElementType } from "@/types/calculator";
import { generateId } from "@/lib/utils";

/** Shared form for both Wall (standalone) and Grade Beam calculators */
export function LinearForm({ calcType }: { calcType: "wall" | "gradeBeam" }) {
  const { state, dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType(calcType);
  const area = activeArea?.type === calcType ? activeArea : null;

  const handleAdd = (customName?: string) => {
    const area = addArea(calcType);
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  const isWall = calcType === "wall";
  const dim1Label = isWall ? "Wall Height" : "Beam Width";
  const dim1Key = isWall ? "heightIn" : "widthIn";
  const dim2Label = isWall ? "Wall Thickness" : "Beam Depth";
  const dim2Key = isWall ? "thicknessIn" : "depthIn";

  const elementType: RebarElementType = calcTypeToElementType(calcType);
  const rebarConfig = area?.rebarConfigs?.[elementType] ?? makeDefaultRebar(elementType);
  const rebarEnabled = rebarConfig.hEnabled || rebarConfig.vEnabled || rebarConfig.gridEnabled;

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        onDiscard={(id) => dispatch({ type: "DELETE_AREA", id })}
        onRename={(id, name) => dispatch({ type: "RENAME_AREA", id, name })}
        type={calcType}
      />

      {area && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label={dim1Label} suffix="in" value={area.dimensions[dim1Key] ?? 0} onChange={(v) => updateDim(dim1Key, v)} />
            <NumberField label={dim2Label} suffix="in" value={area.dimensions[dim2Key] ?? 0} onChange={(v) => updateDim(dim2Key, v)} />
          </div>

          <NumberField
            label="Waste"
            suffix="%"
            value={area.wastePct}
            onChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: v } })}
          />

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Segments</p>
            <SegmentEntry
              segments={area.segments}
              onAdd={(s) =>
                dispatch({
                  type: "ADD_SEGMENT",
                  areaId: area.id,
                  segment: { ...s, id: generateId(), sortOrder: area.segments.length + 1 },
                })
              }
              onUpdate={(id, patch) => dispatch({ type: "UPDATE_SEGMENT", areaId: area.id, segmentId: id, patch })}
              onDelete={(id) => dispatch({ type: "DELETE_SEGMENT", areaId: area.id, segmentId: id })}
            />
          </div>

          <RebarAddon
            enabled={rebarEnabled}
            config={rebarConfig}
            onToggle={(v) => {
              dispatch({
                type: "UPDATE_REBAR",
                areaId: area.id,
                elementType,
                rebar: { hEnabled: v },
              });
            }}
            onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, elementType, rebar: patch })}
            mode="linear"
            verticalLabel="Vertical Rebar"
          />
        </>
      )}
    </div>
  );
}
