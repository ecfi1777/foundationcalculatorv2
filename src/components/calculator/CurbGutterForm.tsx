import { useState, useEffect, useCallback, useRef } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry, type SegmentEntryHandle } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { makeDefaultRebar } from "@/types/calculator";
import { generateId } from "@/lib/utils";

const CURB_DIM_KEYS = ["curbDepthIn", "curbHeightIn", "gutterWidthIn", "flagThicknessIn"] as const;
const CURB_DEFAULTS: Record<string, number> = { curbDepthIn: 6, curbHeightIn: 6, gutterWidthIn: 12, flagThicknessIn: 4 };

export function CurbGutterForm() {
  const { dispatch, addArea, getAreasForType, activeArea, registerFlushCallback, registerSegmentFlush } = useCalculatorState();
  const segmentEntryRef = useRef<SegmentEntryHandle>(null);
  const areas = getAreasForType("curbGutter");
  const area = activeArea?.type === "curbGutter" ? activeArea : null;

  // --- Local state for dimensions & waste ---
  const [localDims, setLocalDims] = useState<Record<string, number>>(() => {
    const d: Record<string, number> = {};
    for (const k of CURB_DIM_KEYS) d[k] = area?.dimensions[k] ?? CURB_DEFAULTS[k];
    return d;
  });
  const [localWaste, setLocalWaste] = useState(area?.wastePct ?? 5);

  // Sync local state when active area switches
  useEffect(() => {
    const d: Record<string, number> = {};
    for (const k of CURB_DIM_KEYS) d[k] = area?.dimensions[k] ?? CURB_DEFAULTS[k];
    setLocalDims(d);
    setLocalWaste(area?.wastePct ?? 5);
  }, [area?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Blur-commit helpers
  const commitDim = useCallback((key: string) => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { dimensions: { ...area.dimensions, [key]: localDims[key] } } });
  }, [area, localDims, dispatch]);

  const commitWaste = useCallback(() => {
    if (!area) return;
    dispatch({ type: "UPDATE_AREA", id: area.id, patch: { wastePct: localWaste } });
  }, [area, localWaste, dispatch]);

  // Register segment flush callback
  useEffect(() => {
    if (!area) {
      registerSegmentFlush(null);
      return;
    }
    registerSegmentFlush(() => segmentEntryRef.current?.flushPending() ?? false);
    return () => registerSegmentFlush(null);
  }, [area?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register flush callback for save-before-blur safety
  useEffect(() => {
    if (!area) {
      registerFlushCallback(null);
      return;
    }
    const flush = () => {
      const dimsPatch: Record<string, number> = {};
      for (const k of CURB_DIM_KEYS) dimsPatch[k] = localDims[k];
      dispatch({
        type: "UPDATE_AREA",
        id: area.id,
        patch: {
          dimensions: { ...area.dimensions, ...dimsPatch },
          wastePct: localWaste,
        },
      });
    };
    registerFlushCallback(flush);
    return () => registerFlushCallback(null);
  }, [area?.id, localDims, localWaste]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (customName?: string) => {
    const a = addArea("curbGutter");
    if (customName) dispatch({ type: "RENAME_AREA", id: a.id, name: customName });
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
            <NumberField label="Curb Depth" suffix="in" value={localDims.curbDepthIn ?? 6} onChange={(v) => setLocalDims(d => ({ ...d, curbDepthIn: v }))} onBlur={() => commitDim("curbDepthIn")} />
            <NumberField label="Curb Height" suffix="in" value={localDims.curbHeightIn ?? 6} onChange={(v) => setLocalDims(d => ({ ...d, curbHeightIn: v }))} onBlur={() => commitDim("curbHeightIn")} />
            <NumberField label="Gutter Width" suffix="in" value={localDims.gutterWidthIn ?? 12} onChange={(v) => setLocalDims(d => ({ ...d, gutterWidthIn: v }))} onBlur={() => commitDim("gutterWidthIn")} />
            <NumberField label="Flag Thickness" suffix="in" value={localDims.flagThicknessIn ?? 4} onChange={(v) => setLocalDims(d => ({ ...d, flagThicknessIn: v }))} onBlur={() => commitDim("flagThicknessIn")} />
          </div>

          <NumberField
            label="Waste"
            suffix="%"
            value={localWaste}
            onChange={(v) => setLocalWaste(v)}
            onBlur={commitWaste}
          />

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
