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
  calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid, calcRebarLBar,
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
    horizPiecesTotal: null,
    vertLf: null,
    vertBarSize: null,
    vertLabel: isFootingElement ? "Dowels" : "Vertical",
    vertPiecesTotal: null,
    gridLf: null,
    gridBarSize: null,
    gridSpacingIn: null,
    gridPiecesTotal: null,
    lbarLf: null,
    lbarBarSize: null,
    lbarSpacingIn: null,
    lbarPiecesTotal: null,
  };

  if (elementType === "slab") {
    if (config.gridEnabled && area.sections.length > 0) {
      // Always compute client-side so piecesTotal is available.
      // Prefer server canonical LF when populated; fall back to client-computed.
      let totalGridLf = 0;
      let totalGridPieces = 0;
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
            insetIn: config.gridInsetIn,
            wastePct: config.gridWastePct || 0,
          });
          totalGridLf += gr.totalWithWasteLf;
          totalGridPieces += gr.piecesTotal;
        }
      }
      result.gridLf = (config.gridTotalLf && config.gridTotalLf > 0)
        ? config.gridTotalLf
        : totalGridLf;
      result.gridPiecesTotal = totalGridPieces;
      result.gridBarSize = config.gridBarSize;
      result.gridSpacingIn = config.gridSpacingIn;
    }
  } else {
    if (totalLinearFt > 0) {
      if (config.hEnabled) {
        const hr = calcRebarHorizontal({
          linearFt: totalLinearFt,
          numRows: config.hNumRows || 1,
          overlapIn: config.hOverlapIn || 12,
          barLengthFt: 20,
          insetIn: config.hInsetIn,
          wastePct: config.hWastePct || 0,
        });
        result.horizLf = (config.hTotalLf && config.hTotalLf > 0)
          ? config.hTotalLf
          : hr.totalWithWasteLf;
        result.horizPiecesTotal = hr.piecesTotal;
        result.horizBarSize = config.hBarSize;
      }
      if (config.vEnabled) {
        const vr = calcRebarVertical({
          linearFt: totalLinearFt,
          barHeightFt: config.vBarHeightFt || 0,
          barHeightIn: config.vBarHeightIn || 0,
          spacingIn: config.vSpacingIn || 12,
          overlapIn: config.vOverlapIn || 12,
          wastePct: config.vWastePct || 0,
        });
        result.vertLf = (config.vTotalLf && config.vTotalLf > 0)
          ? config.vTotalLf
          : vr.totalWithWasteLf;
        result.vertPiecesTotal = vr.piecesTotal;
        result.vertBarSize = config.vBarSize;
      }
      // L-Bar: availability per spec §8.12 is footings/walls/grade_beam/pier_pad.
      // Pre-7c, no pier pad UI can enable lbarEnabled; pier pads have totalLinearFt=0
      // so this branch stays inert until 7c wires the pier pad linearFt source.
      if (config.lbarEnabled) {
        const lb = calcRebarLBar({
          linearFt: totalLinearFt,
          spacingIn: config.lbarSpacingIn || 12,
          verticalFt: config.lbarVerticalFt || 0,
          verticalIn: config.lbarVerticalIn || 0,
          bendLengthIn: config.lbarBendLengthIn || 12,
          barLengthFt: 20,
          overlapIn: config.lbarOverlapIn || 12,
          insetIn: config.lbarInsetIn,
          wastePct: config.lbarWastePct || 0,
        });
        result.lbarLf = (config.lbarTotalLf && config.lbarTotalLf > 0)
          ? config.lbarTotalLf
          : lb.totalWithWasteLf;
        result.lbarPiecesTotal = lb.piecesTotal;
        result.lbarBarSize = config.lbarBarSize;
        result.lbarSpacingIn = config.lbarSpacingIn;
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
  let sectionStoneTons: Map<string, number> | undefined;

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
          sections: area.sections.map((s) => {
            const fracMap: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };
            return {
              lengthFt: s.lengthFt,
              lengthIn: s.lengthIn + (fracMap[s.lengthFraction] ?? 0),
              widthFt: s.widthFt,
              widthIn: s.widthIn + (fracMap[s.widthFraction] ?? 0),
              thicknessIn: s.thicknessIn,
              wastePct: s.wastePct ?? 0,
            };
          }),
        });
        totalSqft = r.totalSqft;
        totalVolumeCy = r.totalVolumeCy;
        totalWithWasteCy = r.totalWithWasteCy;

        // Stone base — area-level config applied to all sections.
        // Per-section tons captured here (canonical source for export read-only lookup).
        if (area.stoneEnabled && (area.stoneDepthIn ?? 0) > 0) {
          let totalStone = 0;
          sectionStoneTons = new Map<string, number>();
          for (const sec of area.sections) {
            const fracMap: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };
            const secLenFt = sec.lengthFt + (sec.lengthIn + (fracMap[sec.lengthFraction] ?? 0)) / 12;
            const secWidFt = sec.widthFt + (sec.widthIn + (fracMap[sec.widthFraction] ?? 0)) / 12;
            const secSqft = secLenFt * secWidFt;
            if (sec.includeStone && secSqft > 0) {
              const sr = calcStoneBase({
                sqft: secSqft,
                depthIn: area.stoneDepthIn ?? 4,
                densityTonsPerCy: 1.4,
                wastePct: sec.wastePct ?? 0,
              });
              sectionStoneTons.set(sec.id, sr.tonsWithWaste);
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
        const fracMap: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };
        for (const sec of area.sections) {
          const lFt = sec.lengthFt + (sec.lengthIn + (fracMap[sec.lengthFraction] ?? 0)) / 12;
          const wFt = sec.widthFt + (sec.widthIn + (fracMap[sec.widthFraction] ?? 0)) / 12;
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
      const diameterTotalIn = (area.dimensions.diameterFt ?? 0) * 12 + (area.dimensions.diameterIn ?? 12) + (area.dimensions.diameterFrac ?? 0);
      const heightTotalIn = (area.dimensions.heightFt ?? 4) * 12 + (area.dimensions.heightIn ?? 0) + (area.dimensions.heightFrac ?? 0);
      const r = calcCylinder({
        diameterIn: diameterTotalIn,
        heightFt: Math.floor(heightTotalIn / 12),
        heightIn: heightTotalIn % 12,
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
    if (config && (config.hEnabled || config.vEnabled || config.gridEnabled || config.lbarEnabled)) {
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
    sectionStoneTons,
  };
}
