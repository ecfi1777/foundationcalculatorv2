/**
 * Assembles ProjectExportData from calculator state.
 * Pure function — no Supabase or UI dependencies.
 */
import type { CalcState } from "@/hooks/useCalculatorState";
import type { ProjectExportData, AreaExportData, ExportCalculatorType } from "@/types/export";
import { CALC_TYPE_TO_DB } from "@/types/calculator";
import { computeArea } from "@/lib/computeArea";
import { calcSlabSection } from "@/lib/calculations/slab";
import { calcStoneBase } from "@/lib/calculations/stoneBase";
import { formatSegment } from "@/lib/segmentParser";
import { LINEAR_TYPES } from "./exportUtils";

interface ProjectInfo {
  name: string;
  notes: string | null;
}

function formatExportDate(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function buildExportData(
  state: CalcState,
  project: ProjectInfo | null,
  stoneTypes: Map<string, string>
): ProjectExportData {
  const areas: AreaExportData[] = [];

  let totalConcrete = 0;
  let totalStone = 0;
  let hasStone = false;
  let totalRebar = 0;
  let hasRebar = false;
  let totalLinearFt = 0;
  let hasLinear = false;
  let totalSqft = 0;
  let hasSqft = false;

  for (const area of state.areas) {
    const result = computeArea(area, stoneTypes);
    const dbType = CALC_TYPE_TO_DB[area.type] as ExportCalculatorType;
    const isLinear = LINEAR_TYPES.includes(dbType);

    // Segments
    const segments = area.segments
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((seg, i) => ({
        sortOrder: i + 1,
        displayValue: formatSegment(seg.feet, seg.inches, seg.fraction),
        lengthInchesDecimal: seg.lengthInchesDecimal,
      }));

    // Sections with stone type name resolution — use calcSlabSection for volume.
    // Stone is computed PER SECTION using the same logic as computeArea (area-level
    // depth/density applied to per-section sqft + per-section waste). The area total
    // (result.stoneTons) equals the sum of per-section values, matching the UI.
    const fracMap: Record<string, number> = { "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75 };
    const areaStoneActive =
      area.type === "slab" && area.stoneEnabled && (area.stoneDepthIn ?? 0) > 0;
    const areaStoneDepthIn = area.stoneDepthIn ?? 4;
    const areaStoneTypeName =
      area.stoneTypeId && stoneTypes ? stoneTypes.get(area.stoneTypeId) ?? null : null;

    const sections = area.sections
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((sec) => {
        const slabResult = calcSlabSection({
          lengthFt: sec.lengthFt,
          lengthIn: sec.lengthIn + (fracMap[sec.lengthFraction] ?? 0),
          widthFt: sec.widthFt,
          widthIn: sec.widthIn + (fracMap[sec.widthFraction] ?? 0),
          thicknessIn: sec.thicknessIn,
          wastePct: sec.wastePct ?? 0,
        });

        // Per-section stone — only when area + section both enable it AND sqft > 0.
        let secStoneTons: number | null = null;
        if (areaStoneActive && sec.includeStone && slabResult.sqft > 0) {
          const sr = calcStoneBase({
            sqft: slabResult.sqft,
            depthIn: areaStoneDepthIn,
            densityTonsPerCy: 1.4,
            wastePct: sec.wastePct ?? 0,
          });
          secStoneTons = sr.tonsWithWaste;
        }

        return {
          name: sec.name,
          lengthFt: sec.lengthFt,
          lengthIn: sec.lengthIn,
          widthFt: sec.widthFt,
          widthIn: sec.widthIn,
          thicknessIn: sec.thicknessIn,
          sqft: slabResult.sqft,
          volumeCY: slabResult.volumeWithWasteCy,
          stoneEnabled: areaStoneActive && sec.includeStone,
          stoneTons: secStoneTons,
          stoneDepthIn: areaStoneActive && sec.includeStone ? areaStoneDepthIn : null,
          stoneTypeName: areaStoneActive && sec.includeStone ? areaStoneTypeName : null,
        };
      });

    // Aggregate rebar values across element types
    let rebarHorizLF: number | null = null;
    let rebarHorizBarSize: string | null = null;
    let rebarVertLF: number | null = null;
    let rebarVertBarSize: string | null = null;
    let rebarGridLF: number | null = null;
    let rebarGridBarSize: string | null = null;
    let rebarGridSpacingIn: number | null = null;

    for (const rr of result.rebarResults) {
      if (rr.horizLf !== null) {
        rebarHorizLF = (rebarHorizLF ?? 0) + rr.horizLf;
        rebarHorizBarSize = rr.horizBarSize;
      }
      if (rr.vertLf !== null) {
        rebarVertLF = (rebarVertLF ?? 0) + rr.vertLf;
        rebarVertBarSize = rr.vertBarSize;
      }
      if (rr.gridLf !== null) {
        rebarGridLF = (rebarGridLF ?? 0) + rr.gridLf;
        rebarGridBarSize = rr.gridBarSize;
        rebarGridSpacingIn = rr.gridSpacingIn;
      }
    }

    const areaRebarTotal = (rebarHorizLF ?? 0) + (rebarVertLF ?? 0) + (rebarGridLF ?? 0);
    const areaHasRebar = areaRebarTotal > 0;

    if (areaHasRebar) {
      hasRebar = true;
      totalRebar += areaRebarTotal;
    }

    totalConcrete += result.totalWithWasteCy;

    if (result.stoneTons !== null) {
      hasStone = true;
      totalStone += result.stoneTons;
    }

    if (isLinear && result.totalLinearFt > 0) {
      hasLinear = true;
      totalLinearFt += result.totalLinearFt;
    }

    if (result.totalSqft > 0) {
      hasSqft = true;
      totalSqft += result.totalSqft;
    }

    areas.push({
      name: area.name,
      calculatorType: dbType,
      totalLinearFt: isLinear ? result.totalLinearFt : null,
      totalSqft: result.totalSqft > 0 ? result.totalSqft : null,
      footingVolumeCY: result.footingVolumeCy > 0 ? result.footingVolumeCy : null,
      wallVolumeCY: result.wallVolumeCy,
      totalVolumeCY: result.totalWithWasteCy,
      rebarEnabled: areaHasRebar,
      rebarHorizLF: rebarHorizLF,
      rebarHorizBarSize,
      rebarVertLF: rebarVertLF,
      rebarVertBarSize,
      rebarGridLF: rebarGridLF,
      rebarGridBarSize,
      rebarGridSpacingIn,
      stoneEnabled: result.stoneTons !== null,
      stoneTons: result.stoneTons,
      segments,
      sections,
    });
  }

  return {
    projectName: project?.name ?? "Untitled Project",
    projectNotes: project?.notes ?? null,
    exportDate: formatExportDate(),
    areas,
    projectTotals: {
      concreteCY: totalConcrete,
      stoneTons: hasStone ? totalStone : null,
      rebarLF: hasRebar ? totalRebar : null,
      linearFt: hasLinear ? totalLinearFt : null,
      sqft: hasSqft ? totalSqft : null,
    },
  };
}
