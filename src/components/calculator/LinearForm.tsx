import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";

/** Shared form for both Wall (standalone) and Grade Beam calculators */
export function LinearForm({ calcType }: { calcType: "wall" | "gradeBeam" }) {
  const { state, dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType(calcType);
  const area = activeArea?.type === calcType ? activeArea : null;

  const handleAdd = () => addArea(calcType);

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  const isWall = calcType === "wall";
  const dim1Label = isWall ? "Wall Height" : "Beam Width";
  const dim1Key = isWall ? "heightIn" : "widthIn";
  const dim2Label = isWall ? "Wall Thickness" : "Beam Depth";
  const dim2Key = isWall ? "thicknessIn" : "depthIn";

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
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
                  segment: { ...s, id: crypto.randomUUID(), sortOrder: area.segments.length + 1 },
                })
              }
              onUpdate={(id, patch) => dispatch({ type: "UPDATE_SEGMENT", areaId: area.id, segmentId: id, patch })}
              onDelete={(id) => dispatch({ type: "DELETE_SEGMENT", areaId: area.id, segmentId: id })}
            />
          </div>

          <RebarAddon
            enabled={area.rebarEnabled}
            config={area.rebar}
            onToggle={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { rebarEnabled: v } })}
            onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, rebar: patch })}
            mode="linear"
          />
        </>
      )}
    </div>
  );
}
