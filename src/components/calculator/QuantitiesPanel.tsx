import { useMemo } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { CalcArea, AreaResult, ProjectTotals, BarSize } from "@/types/calculator";
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
import { Pencil, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

function computeArea(area: CalcArea): AreaResult {
  const totalLinearFt = area.segments.reduce((s, seg) => s + seg.lengthInchesDecimal, 0) / 12;

  let footingVolumeCy = 0;
  let wallVolumeCy: number | null = null;
  let totalVolumeCy = 0;
  let totalWithWasteCy = 0;
  let totalSqft = 0;
  let rebarHorizLf: number | null = null;
  let rebarHorizBarSize: BarSize | null = null;
  let rebarVertLf: number | null = null;
  let rebarVertBarSize: BarSize | null = null;
  let rebarGridLf: number | null = null;
  let rebarGridBarSize: BarSize | null = null;
  let rebarGridSpacingIn: number | null = null;
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

      // Slab rebar grid
      if (area.rebarEnabled && area.sections.length > 0) {
        let totalGridLf = 0;
        for (const sec of area.sections) {
          const lenFt = sec.lengthFt + sec.lengthIn / 12;
          const widFt = sec.widthFt + sec.widthIn / 12;
          if (lenFt > 0 && widFt > 0) {
            const gr = calcRebarSlabGrid({
              lengthFt: lenFt,
              widthFt: widFt,
              spacingIn: area.rebar.gridSpacingIn || 12,
              overlapIn: area.rebar.gridOverlapIn || 12,
              barLengthFt: 20,
              wastePct: area.rebar.gridWastePct || 0,
            });
            totalGridLf += gr.totalWithWasteLf;
          }
        }
        rebarGridLf = totalGridLf;
        rebarGridBarSize = area.rebar.gridBarSize;
        rebarGridSpacingIn = area.rebar.gridSpacingIn;
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

  // Linear rebar (footing, wall, gradeBeam)
  if (
    area.rebarEnabled &&
    totalLinearFt > 0 &&
    ["footing", "wall", "gradeBeam"].includes(area.type)
  ) {
    if (area.rebar.hEnabled) {
      const hr = calcRebarHorizontal({
        linearFt: totalLinearFt,
        numRows: area.rebar.hNumRows || 1,
        overlapIn: area.rebar.hOverlapIn || 12,
        barLengthFt: 20,
        wastePct: area.rebar.hWastePct || 0,
      });
      rebarHorizLf = hr.totalWithWasteLf;
      rebarHorizBarSize = area.rebar.hBarSize;
    }
    if (area.rebar.vEnabled) {
      const vr = calcRebarVertical({
        linearFt: totalLinearFt,
        barHeightFt: area.rebar.vBarHeightFt || 0,
        barHeightIn: area.rebar.vBarHeightIn || 0,
        spacingIn: area.rebar.vSpacingIn || 12,
        overlapIn: area.rebar.vOverlapIn || 12,
        wastePct: area.rebar.vWastePct || 0,
      });
      rebarVertLf = vr.totalWithWasteLf;
      rebarVertBarSize = area.rebar.vBarSize;
    }
  }

  return {
    areaId: area.id,
    areaName: area.name,
    type: area.type,
    totalLinearFt,
    totalSqft,
    footingVolumeCy,
    wallVolumeCy,
    totalVolumeCy,
    totalWithWasteCy,
    rebarHorizLf,
    rebarHorizBarSize,
    rebarVertLf,
    rebarVertBarSize,
    rebarGridLf,
    rebarGridBarSize,
    rebarGridSpacingIn,
    stoneTons,
    stoneDepthIn,
  };
}

export function QuantitiesPanel() {
  const { state, dispatch } = useCalculatorState();

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
      rebarLf += (r.rebarHorizLf ?? 0) + (r.rebarVertLf ?? 0) + (r.rebarGridLf ?? 0);
    }
    return { concreteCy, stoneTons, rebarLf };
  }, [results]);

  const isLinearType = (type: string) => ["footing", "wall", "gradeBeam", "curbGutter"].includes(type);

  return (
    <div className="space-y-4">
      {results.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Add an area to see quantities
        </p>
      )}

      {results.map((r) => (
        <div key={r.areaId} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{r.areaName}</span>
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
          </div>

          {isLinearType(r.type) && (
            <p className="text-sm text-muted-foreground">
              Total Linear Feet: {r.totalLinearFt.toFixed(2)} ft
            </p>
          )}

          {r.type === "slab" && (
            <p className="text-sm text-muted-foreground">
              Total Square Feet: {Math.round(r.totalSqft)} SF
            </p>
          )}

          {r.type === "footing" && r.footingVolumeCy > 0 && (
            <p className="text-sm text-muted-foreground">
              Footing Volume: {r.footingVolumeCy.toFixed(2)} yd³
            </p>
          )}

          {r.wallVolumeCy !== null && r.wallVolumeCy > 0 && (
            <p className="text-sm text-muted-foreground">
              Wall Volume: {r.wallVolumeCy.toFixed(2)} yd³
            </p>
          )}

          <Separator />

          <p className="text-sm font-medium text-foreground">
            Area Total: {r.totalWithWasteCy.toFixed(2)} yd³
          </p>

          {r.rebarHorizLf !== null && (
            <p className="text-sm text-muted-foreground">
              Rebar (Horiz {r.rebarHorizBarSize}): {Math.round(r.rebarHorizLf).toLocaleString()} LF
            </p>
          )}
          {r.rebarVertLf !== null && (
            <p className="text-sm text-muted-foreground">
              Rebar (Vert {r.rebarVertBarSize}): {Math.round(r.rebarVertLf).toLocaleString()} LF
            </p>
          )}
          {r.rebarGridLf !== null && (
            <p className="text-sm text-muted-foreground">
              Rebar Grid ({r.rebarGridBarSize} @ {r.rebarGridSpacingIn}"): {Math.round(r.rebarGridLf).toLocaleString()} LF
            </p>
          )}
          {r.stoneTons !== null && (
            <p className="text-sm text-muted-foreground">
              Stone Base ({r.stoneDepthIn}" #57): {r.stoneTons.toFixed(2)} tons
            </p>
          )}
        </div>
      ))}

      {results.length > 0 && (
        <>
          <Separator className="my-3" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground uppercase tracking-wide">
              Project Totals
            </p>
            <p className="text-sm text-foreground">
              Concrete: {totals.concreteCy.toFixed(2)} yd³
            </p>
            {totals.stoneTons > 0 && (
              <p className="text-sm text-foreground">
                Stone: {totals.stoneTons.toFixed(2)} tons
              </p>
            )}
            {totals.rebarLf > 0 && (
              <p className="text-sm text-foreground">
                Rebar: {Math.round(totals.rebarLf).toLocaleString()} LF
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
