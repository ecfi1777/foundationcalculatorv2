import { useState, useEffect, useCallback, useRef } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { NumberField } from "./NumberField";
import { SegmentEntry, type SegmentEntryHandle } from "./SegmentEntry";
import { RebarAddon } from "./RebarAddon";
import { AreaSelector } from "./AreaSelector";
import { calcTypeToElementType, makeDefaultRebar } from "@/types/calculator";
import type { RebarElementType } from "@/types/calculator";
import { generateId } from "@/lib/utils";

/** Shared form for both Wall (standalone) and Grade Beam calculators */
export function LinearForm({ calcType }: { calcType: "wall" | "gradeBeam" }) {
  const { dispatch, addArea, getAreasForType, activeArea, registerFlushCallback, registerSegmentFlush } = useCalculatorState();
  const segmentEntryRef = useRef<SegmentEntryHandle>(null);
  const areas = getAreasForType(calcType);
  const area = activeArea?.type === calcType ? activeArea : null;

  const isWall = calcType === "wall";
  const dim1Label = isWall ? "Wall Height" : "Beam Width";
  const dim1Key = isWall ? "heightIn" : "widthIn";
  const dim2Label = isWall ? "Wall Thickness" : "Beam Depth";
  const dim2Key = isWall ? "thicknessIn" : "depthIn";

  // --- Local state for dimensions & waste ---
  const [localDims, setLocalDims] = useState<Record<string, number>>({
    [dim1Key]: area?.dimensions[dim1Key] ?? 0,
    [dim2Key]: area?.dimensions[dim2Key] ?? 0,
  });
  const [localWaste, setLocalWaste] = useState(area?.wastePct ?? 5);

  // Sync local state when active area switches
  useEffect(() => {
    setLocalDims({
      [dim1Key]: area?.dimensions[dim1Key] ?? 0,
      [dim2Key]: area?.dimensions[dim2Key] ?? 0,
    });
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
      dispatch({
        type: "UPDATE_AREA",
        id: area.id,
        patch: {
          dimensions: { ...area.dimensions, [dim1Key]: localDims[dim1Key], [dim2Key]: localDims[dim2Key] },
          wastePct: localWaste,
        },
      });
    };
    registerFlushCallback(flush);
    return () => registerFlushCallback(null);
  }, [area?.id, localDims, localWaste]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = (customName?: string) => {
    const a = addArea(calcType);
    if (customName) dispatch({ type: "RENAME_AREA", id: a.id, name: customName });
  };

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
            <NumberField label={dim1Label} suffix="in" value={localDims[dim1Key] ?? 0} onChange={(v) => setLocalDims(d => ({ ...d, [dim1Key]: v }))} onBlur={() => commitDim(dim1Key)} />
            <NumberField label={dim2Label} suffix="in" value={localDims[dim2Key] ?? 0} onChange={(v) => setLocalDims(d => ({ ...d, [dim2Key]: v }))} onBlur={() => commitDim(dim2Key)} />
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
