import { useState, useEffect, useRef } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry, type SegmentEntryHandle } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { Button } from "@/components/ui/button";
import type { FootingMode } from "@/types/calculator";
import { makeDefaultRebar } from "@/types/calculator";
import { generateId } from "@/lib/utils";

const MODES: { value: FootingMode; label: string }[] = [
  { value: "footingsOnly", label: "Footings Only" },
  { value: "footingsWalls", label: "Footings + Walls" },
];

export function FootingForm() {
  const { state, dispatch, addArea, getAreasForType, activeArea, registerFlushCallback, registerSegmentFlush } = useCalculatorState();
  const segmentEntryRef = useRef<SegmentEntryHandle>(null);
  const areas = getAreasForType("footing");

  const handleAdd = (customName?: string) => {
    const area = addArea("footing", "footingsOnly");
    if (customName) dispatch({ type: "RENAME_AREA", id: area.id, name: customName });
  };

  const area = activeArea?.type === "footing" ? activeArea : null;
  const mode = area?.footingMode ?? "footingsOnly";

  // --- Local state for dimensions & waste (blur-commit pattern) ---
  const [localDims, setLocalDims] = useState<Record<string, number>>({});
  const [localWaste, setLocalWaste] = useState(0);

  // Sync local state from area on area switch
  useEffect(() => {
    if (area) {
      setLocalDims({ ...area.dimensions });
      setLocalWaste(area.wastePct);
    }
  }, [area?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register segment flush callback
  useEffect(() => {
    if (!area) {
      registerSegmentFlush(null);
      return;
    }
    registerSegmentFlush(() => segmentEntryRef.current?.flushPending() ?? false);
    return () => registerSegmentFlush(null);
  }, [area?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register flush callback so Save Area can commit un-blurred values
  useEffect(() => {
    if (!area) {
      registerFlushCallback(null);
      return;
    }
    const flush = () => {
      dispatch({
        type: "UPDATE_AREA",
        id: area.id,
        patch: { dimensions: { ...localDims }, wastePct: localWaste },
      });
    };
    registerFlushCallback(flush);
    return () => registerFlushCallback(null);
  }, [area?.id, localDims, localWaste, dispatch, registerFlushCallback]); // eslint-disable-line react-hooks/exhaustive-deps

  // Commit a single dimension on blur
  const commitDim = (key: string) => {
    if (!area) return;
    dispatch({
      type: "UPDATE_AREA",
      id: area.id,
      patch: { dimensions: { ...area.dimensions, [key]: localDims[key] ?? 0 } },
    });
  };

  const commitWaste = () => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: localWaste } });
  };

  const setMode = (m: FootingMode) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { footingMode: m } });
  };

  const showFooting = mode === "footingsOnly" || mode === "footingsWalls";
  const showWall = mode === "footingsWalls" || mode === "wallsOnly";

  const footingRebar = area?.rebarConfigs?.footing ?? makeDefaultRebar("footing");
  const wallRebar = area?.rebarConfigs?.wall ?? makeDefaultRebar("wall");

  const footingRebarEnabled = footingRebar.hEnabled || footingRebar.vEnabled || footingRebar.gridEnabled;
  const wallRebarEnabled = wallRebar.hEnabled || wallRebar.vEnabled || wallRebar.gridEnabled;

  return (
    <div className="space-y-4">
      <AreaSelector
        areas={areas}
        activeAreaId={area?.id ?? null}
        onSelect={(id) => dispatch({ type: "SET_ACTIVE_AREA", id })}
        onAdd={handleAdd}
        onDiscard={(id) => dispatch({ type: "DELETE_AREA", id })}
        onRename={(id, name) => dispatch({ type: "RENAME_AREA", id, name })}
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
              <NumberField
                label="Footing Width"
                suffix="in"
                value={localDims.widthIn ?? 12}
                onChange={(v) => setLocalDims((prev) => ({ ...prev, widthIn: v }))}
                onBlur={() => commitDim("widthIn")}
              />
              <NumberField
                label="Footing Depth"
                suffix="in"
                value={localDims.depthIn ?? 8}
                onChange={(v) => setLocalDims((prev) => ({ ...prev, depthIn: v }))}
                onBlur={() => commitDim("depthIn")}
              />
            </div>
          )}

          {/* Wall fields */}
          {showWall && (
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Wall Height"
                suffix="in"
                value={localDims.wallHeightIn ?? 48}
                onChange={(v) => setLocalDims((prev) => ({ ...prev, wallHeightIn: v }))}
                onBlur={() => commitDim("wallHeightIn")}
              />
              <NumberField
                label="Wall Thickness"
                suffix="in"
                value={localDims.wallThicknessIn ?? 8}
                onChange={(v) => setLocalDims((prev) => ({ ...prev, wallThicknessIn: v }))}
                onBlur={() => commitDim("wallThicknessIn")}
              />
            </div>
          )}

          <NumberField
            label="Waste"
            suffix="%"
            value={localWaste}
            onChange={(v) => setLocalWaste(v)}
            onBlur={commitWaste}
          />

          {/* Segments */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Segments</p>
            <SegmentEntry
              ref={segmentEntryRef}
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

          {/* Footing Rebar */}
          {showFooting && (
            <RebarAddon
              enabled={footingRebarEnabled}
              config={footingRebar}
              onToggle={(v) => {
                dispatch({
                  type: "UPDATE_REBAR",
                  areaId: area.id,
                  elementType: "footing",
                  rebar: { hEnabled: v },
                });
              }}
              onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, elementType: "footing", rebar: patch })}
              mode="linear"
              sectionLabel={mode === "footingsWalls" ? "Footing Rebar" : "Add Rebar"}
              verticalLabel="Dowels"
            />
          )}

          {/* Wall Rebar */}
          {showWall && (
            <RebarAddon
              enabled={wallRebarEnabled}
              config={wallRebar}
              onToggle={(v) => {
                dispatch({
                  type: "UPDATE_REBAR",
                  areaId: area.id,
                  elementType: "wall",
                  rebar: { hEnabled: v },
                });
              }}
              onChange={(patch) => dispatch({ type: "UPDATE_REBAR", areaId: area.id, elementType: "wall", rebar: patch })}
              mode="linear"
              sectionLabel={mode === "footingsWalls" ? "Wall Rebar" : "Add Rebar"}
              verticalLabel="Vertical Rebar"
            />
          )}
        </>
      )}
    </div>
  );
}
