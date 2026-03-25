/**
 * Slab calculator — per-section + area totals
 * Waste is applied per-section.
 */
import type { SlabSectionInput, SlabSectionResult, SlabAreaInput, SlabAreaResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_SECTION: SlabSectionResult = { sqft: 0, volumeCy: 0, volumeWithWasteCy: 0 };

export function calcSlabSection(input: SlabSectionInput): SlabSectionResult {
  const lengthFt = input.lengthFt + inchesToFeet(input.lengthIn);
  const widthFt = input.widthFt + inchesToFeet(input.widthIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);

  if (lengthFt <= 0 || widthFt <= 0 || thicknessFt < 0) return { ...ZERO_SECTION };

  const sqft = lengthFt * widthFt;
  const volumeCy = cubicFtToCy(sqft * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);

  return { sqft, volumeCy, volumeWithWasteCy };
}

export function calcSlabArea(input: SlabAreaInput): SlabAreaResult {
  const sections = input.sections.map(calcSlabSection);
  const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0);
  const totalVolumeCy = sections.reduce((sum, s) => sum + s.volumeCy, 0);
  const totalWithWasteCy = sections.reduce((sum, s) => sum + s.volumeWithWasteCy, 0);

  return { sections, totalSqft, totalVolumeCy, totalWithWasteCy };
}
