/**
 * Shared area computation logic.
 * Used by QuantitiesPanel (UI) and buildExportData (export).
 * Pure TypeScript — no UI or Supabase dependencies.
 */
import type {
  CalcArea, AreaResult, RebarResult, RebarElementType,
} from "@/types/calculator";
import { getElementTypes, makeDefaultRebar } from "@/types/calculator";
import {
  calcFooting, calcWall, calcGradeBeam, calcCurbGutter,
  calcSlabArea, calcPierPad, calcCylinder, calcSteps,
  calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid,
  calcStoneBase,
} from "@/lib/calculations";

export function computeRebarForElement(
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
    if (config.gridEnabled && area.sections.length > 0) {
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

export function computeArea(area: CalcArea, stoneTypeNames?: Map<string, string>): AreaResult {
  const totalLinearFt = area.segments.reduce((s, seg) => s + seg.lengthInchesDecimal, 0) / 12;

  let footingVolumeCy = 0;
  let wallVolumeCy: number | null = null;
  let totalVolumeCy = 0;
  let totalWithWasteCy = 0;
  let totalSqft = 0;
  let stoneTons: number | null = null;
  let stoneDepthIn: number | null = null;
  let stoneTypeName: string | null = null;

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

        // Stone base — area-level config applied to all sections
        if (area.stoneEnabled && (area.stoneDepthIn ?? 0) > 0) {
          let totalStone = 0;
          for (const sec of area.sections) {
            const secLenFt = sec.lengthFt + sec.lengthIn / 12;
            const secWidFt = sec.widthFt + sec.widthIn / 12;
            const secSqft = secLenFt * secWidFt;
            if (secSqft > 0) {
              const sr = calcStoneBase({
                sqft: secSqft,
                depthIn: area.stoneDepthIn ?? 4,
                densityTonsPerCy: 1.4,
                wastePct: area.wastePct,
              });
              totalStone += sr.tonsWithWaste;
            }
          }
          if (totalStone > 0) {
            stoneTons = totalStone;
            stoneDepthIn = area.stoneDepthIn ?? 4;
            if (area.stoneTypeId && stoneTypeNames) {
              stoneTypeName = stoneTypeNames.get(area.stoneTypeId) ?? null;
            }
          }
        }
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
    stoneTypeName,
  };
}
