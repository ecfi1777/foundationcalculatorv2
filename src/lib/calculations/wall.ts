/**
 * Wall standalone calculator
 * Formula: linearFt × (heightIn/12) × (thicknessIn/12) / 27
 */
import type { WallInput, WallResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_WALL: WallResult = { volumeCy: 0, volumeWithWasteCy: 0 };

/**
 * Calculate wall concrete volume.
 * @param input.linearFt - Total linear feet of wall
 * @param input.heightIn - Wall height in inches
 * @param input.thicknessIn - Wall thickness in inches
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns volumeCy in cubic yards, volumeWithWasteCy with waste applied
 */
export function calcWall(input: WallInput): WallResult {
  if (input.linearFt <= 0 || input.heightIn < 0 || input.thicknessIn < 0) return { ...ZERO_WALL };

  const heightFt = inchesToFeet(input.heightIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const volumeCy = cubicFtToCy(input.linearFt * heightFt * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}
