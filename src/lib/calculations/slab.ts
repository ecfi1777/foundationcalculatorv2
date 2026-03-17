/**
 * Slab calculator — per-section + area totals
 * Section volume: (lengthFt + lengthIn/12) × (widthFt + widthIn/12) × (thicknessIn/12) / 27
 */
import type { SlabSectionInput, SlabSectionResult, SlabAreaInput, SlabAreaResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_SECTION: SlabSectionResult = { sqft: 0, volumeCy: 0 };

/**
 * Calculate a single slab section's area and concrete volume.
 * @param input.lengthFt - Section length, whole feet
 * @param input.lengthIn - Section length, remaining inches
 * @param input.widthFt - Section width, whole feet
 * @param input.widthIn - Section width, remaining inches
 * @param input.thicknessIn - Slab thickness in inches
 * @returns sqft in square feet, volumeCy in cubic yards
 */
export function calcSlabSection(input: SlabSectionInput): SlabSectionResult {
  const lengthFt = input.lengthFt + inchesToFeet(input.lengthIn);
  const widthFt = input.widthFt + inchesToFeet(input.widthIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);

  if (lengthFt <= 0 || widthFt <= 0 || thicknessFt < 0) return { ...ZERO_SECTION };

  const sqft = lengthFt * widthFt;
  const volumeCy = cubicFtToCy(sqft * thicknessFt);

  return { sqft, volumeCy };
}

/**
 * Calculate totals for a slab area composed of multiple sections.
 * @param input.sections - Array of SlabSectionInput
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns sections results array, totalSqft in square feet, totalVolumeCy and totalWithWasteCy in cubic yards
 */
export function calcSlabArea(input: SlabAreaInput): SlabAreaResult {
  const sections = input.sections.map(calcSlabSection);
  const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0);
  const totalVolumeCy = sections.reduce((sum, s) => sum + s.volumeCy, 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);

  return { sections, totalSqft, totalVolumeCy, totalWithWasteCy };
}
