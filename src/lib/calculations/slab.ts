/**
 * Slab calculator — per-section + area totals
 * Section volume: (lengthFt + lengthIn/12) × (widthFt + widthIn/12) × (thicknessIn/12) / 27
 */
import type { SlabSectionInput, SlabSectionResult, SlabAreaInput, SlabAreaResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcSlabSection(input: SlabSectionInput): SlabSectionResult {
  const lengthFt = input.lengthFt + inchesToFeet(input.lengthIn);
  const widthFt = input.widthFt + inchesToFeet(input.widthIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);

  const sqft = lengthFt * widthFt;
  const volumeCy = cubicFtToCy(sqft * thicknessFt);

  return { sqft, volumeCy };
}

export function calcSlabArea(input: SlabAreaInput): SlabAreaResult {
  const sections = input.sections.map(calcSlabSection);
  const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0);
  const totalVolumeCy = sections.reduce((sum, s) => sum + s.volumeCy, 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);

  return { sections, totalSqft, totalVolumeCy, totalWithWasteCy };
}
