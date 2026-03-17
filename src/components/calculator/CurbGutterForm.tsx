import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { makeDefaultRebar } from "@/types/calculator";
import { generateId } from "@/lib/utils";

export function CurbGutterForm() {
  const { dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("curbGutter");
  const area = activeArea?.type === "curbGutter" ? activeArea : null;

  const handleAdd = (customName?: string) => {
    const area = addArea("curbGutter");
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  const rebarConfig = area?.rebarConfigs?.curb ?? makeDefaultRebar("curb");
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
        type="curbGutter"
      />

      {area && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Curb Depth" suffix="in" value={area.dimensions.curbDepthIn ?? 6} onChange={(v) => updateDim("curbDepthIn", v)} />
            <NumberField label="Curb Height" suffix="in" value={area.dimensions.curbHeightIn ?? 6} onChange={(v) => updateDim("curbHeightIn", v)} />
            <NumberField label="Gutter Width" suffix="in" value={area.dimensions.gutterWidthIn ?? 12} onChange={(v) => updateDim("gutterWidthIn", v)} />
            <NumberField label="Flag Thickness" suffix="in" value={area.dimensions.flagThicknessIn ?? 4} onChange={(v) => updateDim("flagThicknessIn", v)} />
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
            enabled={rebarEnabled}
            config={rebarConfig}
            onToggle={(v) => {
              dispatch({
                type: "UPDATE_REBAR",
                areaId: area.id,
                elementType: "curb",
                rebar: { hEnabled: v },
              });
            }}
            onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, elementType: "curb", rebar: patch })}
            mode="linear"
            verticalLabel="Vertical Rebar"
          />
        </>
      )}
    </div>
  );
}
