import { useMemo, useState } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type {
  CalcArea, AreaResult, ProjectTotals, BarSize,
  RebarResult, RebarElementType,
} from "@/types/calculator";
import { getElementTypes, makeDefaultRebar } from "@/types/calculator";
import {
  calcFooting,
  calcWall,
  calcGradeBeam,
  calcCurbGutter,
  calcSlabArea,
  calcPierPad,
  calcCylinder,
  calcSteps,
  calcRebarHorizontal,
  calcRebarVertical,
  calcRebarSlabGrid,
  calcStoneBase,
} from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function computeRebarForElement(
  area: CalcArea,
  elementType: RebarElementType,
  totalLinearFt: number
): RebarResult {
  const config = area.rebarConfigs[elementType] ?? makeDefaultRebar(elementType);
  const isFootingElement = elementType === "footing";
  const result: RebarResult = {
    elementType,
    horizLf: null,
    horizBarSize: null,
    vertLf: null,
    vertBarSize: null,
    vertLabel: isFootingElement ? "Dowels" : "Vertical",
    gridLf: null,
    gridBarSize: null,
    gridSpacingIn: null,
  };

  if (elementType === "slab") {
    // Grid rebar for slabs
    if (config.gridEnabled && area.sections.length > 0) {
      // Use cached canonical value if available
      if (config.gridTotalLf && config.gridTotalLf > 0) {
        result.gridLf = config.gridTotalLf;
      } else {
        let totalGridLf = 0;
        for (const sec of area.sections) {
          const lenFt = sec.lengthFt + sec.lengthIn / 12;
          const widFt = sec.widthFt + sec.widthIn / 12;
          if (lenFt > 0 && widFt > 0) {
            const gr = calcRebarSlabGrid({
              lengthFt: lenFt,
              widthFt: widFt,
              spacingIn: config.gridSpacingIn || 12,
              overlapIn: config.gridOverlapIn || 12,
              barLengthFt: 20,
              wastePct: config.gridWastePct || 0,
            });
            totalGridLf += gr.totalWithWasteLf;
          }
        }
        result.gridLf = totalGridLf;
      }
      result.gridBarSize = config.gridBarSize;
      result.gridSpacingIn = config.gridSpacingIn;
    }
  } else {
    // Linear rebar (horiz + vert)
    if (totalLinearFt > 0) {
      if (config.hEnabled) {
        if (config.hTotalLf && config.hTotalLf > 0) {
          result.horizLf = config.hTotalLf;
        } else {
          const hr = calcRebarHorizontal({
            linearFt: totalLinearFt,
            numRows: config.hNumRows || 1,
            overlapIn: config.hOverlapIn || 12,
            barLengthFt: 20,
            wastePct: config.hWastePct || 0,
          });
          result.horizLf = hr.totalWithWasteLf;
        }
        result.horizBarSize = config.hBarSize;
      }
      if (config.vEnabled) {
        if (config.vTotalLf && config.vTotalLf > 0) {
          result.vertLf = config.vTotalLf;
        } else {
          const vr = calcRebarVertical({
            linearFt: totalLinearFt,
            barHeightFt: config.vBarHeightFt || 0,
            barHeightIn: config.vBarHeightIn || 0,
            spacingIn: config.vSpacingIn || 12,
            overlapIn: config.vOverlapIn || 12,
            wastePct: config.vWastePct || 0,
          });
          result.vertLf = vr.totalWithWasteLf;
        }
        result.vertBarSize = config.vBarSize;
      }
    }
  }

  return result;
}

function computeArea(area: CalcArea): AreaResult {
  const totalLinearFt = area.segments.reduce((s, seg) => s + seg.lengthInchesDecimal, 0) / 12;

  let footingVolumeCy = 0;
  let wallVolumeCy: number | null = null;
  let totalVolumeCy = 0;
  let totalWithWasteCy = 0;
  let totalSqft = 0;
  let stoneTons: number | null = null;
  let stoneDepthIn: number | null = null;

  switch (area.type) {
    case "footing": {
      const showFooting = area.footingMode !== "wallsOnly";
      const showWall = area.footingMode === "footingsWalls" || area.footingMode === "wallsOnly";

      if (showFooting) {
        const r = calcFooting({
          linearFt: totalLinearFt,
          widthIn: area.dimensions.widthIn ?? 12,
          depthIn: area.dimensions.depthIn ?? 8,
          wastePct: area.wastePct,
          wall: showWall
            ? { heightIn: area.dimensions.wallHeightIn ?? 48, thicknessIn: area.dimensions.wallThicknessIn ?? 8 }
            : undefined,
        });
        footingVolumeCy = r.footingVolumeCy;
        wallVolumeCy = r.wallVolumeCy;
        totalVolumeCy = r.totalVolumeCy;
        totalWithWasteCy = r.totalWithWasteCy;
      } else if (showWall) {
        const r = calcWall({
          linearFt: totalLinearFt,
          heightIn: area.dimensions.wallHeightIn ?? 48,
          thicknessIn: area.dimensions.wallThicknessIn ?? 8,
          wastePct: area.wastePct,
        });
        wallVolumeCy = r.volumeCy;
        totalVolumeCy = r.volumeCy;
        totalWithWasteCy = r.volumeWithWasteCy;
      }
      break;
    }
    case "wall": {
      const r = calcWall({
        linearFt: totalLinearFt,
        heightIn: area.dimensions.heightIn ?? 48,
        thicknessIn: area.dimensions.thicknessIn ?? 8,
        wastePct: area.wastePct,
      });
      totalVolumeCy = r.volumeCy;
      totalWithWasteCy = r.volumeWithWasteCy;
      break;
    }
    case "gradeBeam": {
      const r = calcGradeBeam({
        linearFt: totalLinearFt,
        widthIn: area.dimensions.widthIn ?? 12,
        depthIn: area.dimensions.depthIn ?? 12,
        wastePct: area.wastePct,
      });
      totalVolumeCy = r.volumeCy;
      totalWithWasteCy = r.volumeWithWasteCy;
      break;
    }
    case "curbGutter": {
      const r = calcCurbGutter({
        linearFt: totalLinearFt,
        curbDepthIn: area.dimensions.curbDepthIn ?? 6,
        curbHeightIn: area.dimensions.curbHeightIn ?? 6,
        gutterWidthIn: area.dimensions.gutterWidthIn ?? 12,
        flagThicknessIn: area.dimensions.flagThicknessIn ?? 4,
        wastePct: area.wastePct,
      });
      totalVolumeCy = r.volumeCy;
      totalWithWasteCy = r.volumeWithWasteCy;
      break;
    }
    case "slab": {
      if (area.sections.length > 0) {
        const r = calcSlabArea({
          sections: area.sections.map((s) => ({
            lengthFt: s.lengthFt,
            lengthIn: s.lengthIn,
            widthFt: s.widthFt,
            widthIn: s.widthIn,
            thicknessIn: s.thicknessIn,
          })),
          wastePct: area.wastePct,
        });
        totalSqft = r.totalSqft;
        totalVolumeCy = r.totalVolumeCy;
        totalWithWasteCy = r.totalWithWasteCy;

        // Stone per section
        let totalStone = 0;
        let stoneActive = false;
        for (const sec of area.sections) {
          if (sec.includeStone && sec.stoneDepthIn > 0) {
            stoneActive = true;
            const secLenFt = sec.lengthFt + sec.lengthIn / 12;
            const secWidFt = sec.widthFt + sec.widthIn / 12;
            const secSqft = secLenFt * secWidFt;
            const sr = calcStoneBase({
              sqft: secSqft,
              depthIn: sec.stoneDepthIn,
              densityTonsPerCy: 1.4,
              wastePct: area.wastePct,
            });
            totalStone += sr.tonsWithWaste;
            stoneDepthIn = sec.stoneDepthIn;
          }
        }
        if (stoneActive) stoneTons = totalStone;
      }
      break;
    }
    case "pierPad": {
      if (area.sections.length > 0) {
        let totalVol = 0;
        for (const sec of area.sections) {
          const lFt = sec.lengthFt + sec.lengthIn / 12;
          const wFt = sec.widthFt + sec.widthIn / 12;
          const r = calcPierPad({
            lengthIn: lFt * 12,
            widthIn: wFt * 12,
            depthIn: area.dimensions.depthIn ?? 6,
            quantity: area.dimensions.quantity ?? 1,
            wastePct: area.wastePct,
          });
          totalVol += r.totalWithWasteCy;
        }
        totalVolumeCy = totalVol;
        totalWithWasteCy = totalVol;
      }
      break;
    }
    case "cylinder": {
      const r = calcCylinder({
        diameterIn: area.dimensions.diameterIn ?? 12,
        heightFt: area.dimensions.heightFt ?? 4,
        heightIn: area.dimensions.heightIn ?? 0,
        quantity: area.dimensions.quantity ?? 1,
        wastePct: area.wastePct,
      });
      totalVolumeCy = r.totalVolumeCy;
      totalWithWasteCy = r.totalWithWasteCy;
      break;
    }
    case "steps": {
      const r = calcSteps({
        numSteps: area.dimensions.numSteps ?? 3,
        riseIn: area.dimensions.riseIn ?? 7,
        runIn: area.dimensions.runIn ?? 11,
        throatDepthIn: area.dimensions.throatDepthIn ?? 6,
        widthIn: area.dimensions.widthIn ?? 36,
        platformDepthIn: area.dimensions.platformDepthIn ?? 0,
        platformWidthIn: area.dimensions.platformWidthIn ?? 0,
        wastePct: area.wastePct,
      });
      totalVolumeCy = r.volumeCy;
      totalWithWasteCy = r.volumeWithWasteCy;
      break;
    }
  }

  // Compute rebar per visible element type
  const visibleElementTypes = getElementTypes(area.type, area.footingMode);
  const rebarResults: RebarResult[] = [];
  for (const et of visibleElementTypes) {
    const config = area.rebarConfigs[et];
    if (config && (config.hEnabled || config.vEnabled || config.gridEnabled)) {
      rebarResults.push(computeRebarForElement(area, et, totalLinearFt));
    }
  }

  return {
    areaId: area.id,
    areaName: area.name,
    type: area.type,
    footingMode: area.footingMode,
    totalLinearFt,
    totalSqft,
    footingVolumeCy,
    wallVolumeCy,
    totalVolumeCy,
    totalWithWasteCy,
    rebarResults,
    stoneTons,
    stoneDepthIn,
  };
}

function getRebarLabel(
  elementType: RebarElementType,
  isMultiElement: boolean
): string {
  if (!isMultiElement) return "";
  switch (elementType) {
    case "footing": return "Footing ";
    case "wall": return "Wall ";
    case "grade_beam": return "Grade Beam ";
    case "curb": return "Curb ";
    case "slab": return "";
    default: return "";
  }
}

export function QuantitiesPanel() {
  const { state, dispatch } = useCalculatorState();
  const [renamingAreaId, setRenamingAreaId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const confirmRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && renamingAreaId) {
      dispatch({ type: "RENAME_AREA", id: renamingAreaId, name: trimmed });
    }
    setRenamingAreaId(null);
  };

  const cancelRename = () => {
    setRenamingAreaId(null);
  };

  const results = useMemo(
    () => state.areas.map(computeArea),
    [state.areas]
  );

  const totals: ProjectTotals = useMemo(() => {
    let concreteCy = 0;
    let stoneTons = 0;
    let rebarLf = 0;
    for (const r of results) {
      concreteCy += r.totalWithWasteCy;
      stoneTons += r.stoneTons ?? 0;
      for (const rr of r.rebarResults) {
        rebarLf += (rr.horizLf ?? 0) + (rr.vertLf ?? 0) + (rr.gridLf ?? 0);
      }
    }
    return { concreteCy, stoneTons, rebarLf };
  }, [results]);

  const isLinearType = (type: string) => ["footing", "wall", "gradeBeam", "curbGutter"].includes(type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Quantities</h2>
        <p className="text-xs text-muted-foreground">Real-time project totals</p>
      </div>

      {/* Areas list — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-4 mb-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No areas yet</p>
            <p className="text-sm text-muted-foreground">Add segments to see calculations</p>
          </div>
        ) : (
          results.map((r) => {
            const isMultiElement = r.rebarResults.length > 1;

            return (
              <div key={r.areaId} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {renamingAreaId === r.areaId ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        onBlur={cancelRename}
                        autoFocus
                        className="h-6 text-sm px-1.5 py-0"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 px-2 text-xs shrink-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={confirmRename}
                      >
                        Save
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={cancelRename}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span
                        className="text-sm font-semibold text-foreground cursor-pointer hover:underline"
                        onClick={() => {
                          setRenamingAreaId(r.areaId);
                          setRenameValue(r.areaName);
                        }}
                        title="Click to rename"
                      >
                        {r.areaName}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => dispatch({ type: "SET_ACTIVE_AREA", id: r.areaId })}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => dispatch({ type: "DELETE_AREA", id: r.areaId })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {isLinearType(r.type) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Linear Feet:</span>
                    <span className="font-mono text-foreground">{r.totalLinearFt.toFixed(2)} ft</span>
                  </div>
                )}
                {r.type === "slab" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Square Feet:</span>
                    <span className="font-mono text-foreground">{Math.round(r.totalSqft)} SF</span>
                  </div>
                )}
                {r.type === "footing" && r.footingVolumeCy > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Footing Volume:</span>
                    <span className="font-mono text-foreground">{r.footingVolumeCy.toFixed(2)} yd³</span>
                  </div>
                )}
                {r.wallVolumeCy !== null && r.wallVolumeCy > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wall Volume:</span>
                    <span className="font-mono text-foreground">{r.wallVolumeCy.toFixed(2)} yd³</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Area Total:</span>
                  <span className="font-semibold text-primary font-mono">{r.totalWithWasteCy.toFixed(2)} yd³</span>
                </div>

                {r.rebarResults.map((rr) => {
                  const prefix = getRebarLabel(rr.elementType, isMultiElement);
                  return (
                    <div key={rr.elementType}>
                      {rr.horizLf !== null && rr.horizLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {prefix}Rebar ({rr.horizBarSize} Horiz):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.horizLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                      {rr.vertLf !== null && rr.vertLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {prefix}{rr.vertLabel} ({rr.vertBarSize}):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.vertLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                      {rr.gridLf !== null && rr.gridLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Rebar Grid ({rr.gridBarSize} @ {rr.gridSpacingIn}"):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.gridLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {r.stoneTons !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stone Base ({r.stoneDepthIn}" #57):</span>
                    <span className="font-mono text-foreground">{r.stoneTons.toFixed(2)} tons</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PROJECT TOTALS — always pinned */}
      <div className="border-t border-border bg-card px-4 py-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Totals
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-foreground">Concrete</span>
          <span className="font-semibold text-primary font-mono">
            {totals.concreteCy.toFixed(2)} yd³
          </span>
        </div>
        {totals.stoneTons > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Stone</span>
            <span className="font-semibold text-primary font-mono">
              {totals.stoneTons.toFixed(2)} tons
            </span>
          </div>
        )}
        {totals.rebarLf > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Rebar</span>
            <span className="font-semibold text-primary font-mono">
              {Math.round(totals.rebarLf).toLocaleString()} LF
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
