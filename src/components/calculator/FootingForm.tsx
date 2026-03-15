import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { Button } from "@/components/ui/button";
import type { FootingMode } from "@/types/calculator";

const MODES: { value: FootingMode; label: string }[] = [
  { value: "footingsOnly", label: "Footings Only" },
  { value: "footingsWalls", label: "Footings + Walls" },
  { value: "wallsOnly", label: "Walls Only" },
];

export function FootingForm() {
  const { state, dispatch, addArea, getAreasForType, activeArea } = useCalculatorState();
  const areas = getAreasForType("footing");

  const handleAdd = () => addArea("footing", "footingsOnly");

  const area = activeArea?.type === "footing" ? activeArea : null;
  const mode = area?.footingMode ?? "footingsOnly";

  const updateDim = (key: string, value: number) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: value } } });
  };

  const setMode = (m: FootingMode) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { footingMode: m } });
  };

  const showFooting = mode === "footingsOnly" || mode === "footingsWalls";
  const showWall = mode === "footingsWalls" || mode === "wallsOnly";

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        type="footing"
      />

      {area && (
        <>
          {/* Mode selector */}
          <div className="flex gap-1.5">
            {MODES.map((m) => (
              <Button
                key={m.value}
                size="sm"
                variant={mode === m.value ? "default" : "outline"}
                onClick={() => setMode(m.value)}
                className="flex-1 text-xs font-semibold"
              >
                {m.label}
              </Button>
            ))}
          </div>

          {/* Footing fields */}
          {showFooting && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Footing Width" suffix="in" value={area.dimensions.widthIn ?? 12} onChange={(v) => updateDim("widthIn", v)} />
              <NumberField label="Footing Depth" suffix="in" value={area.dimensions.depthIn ?? 8} onChange={(v) => updateDim("depthIn", v)} />
            </div>
          )}

          {/* Wall fields */}
          {showWall && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Wall Height" suffix="in" value={area.dimensions.wallHeightIn ?? 48} onChange={(v) => updateDim("wallHeightIn", v)} />
              <NumberField label="Wall Thickness" suffix="in" value={area.dimensions.wallThicknessIn ?? 8} onChange={(v) => updateDim("wallThicknessIn", v)} />
            </div>
          )}

          <NumberField
            label="Waste"
            suffix="%"
            value={area.wastePct}
            onChange={(v) => dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: v } })}
          />

          {/* Segments */}
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

          {/* Rebar */}
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
