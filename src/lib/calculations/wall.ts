/**
 * Wall standalone calculator
 * Formula: linearFt × (heightIn/12) × (thicknessIn/12) / 27
 */
import type { WallInput, WallResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_WALL: WallResult = { volumeCy: 0, volumeWithWasteCy: 0 };

export function calcWall(input: WallInput): WallResult {
  if (input.linearFt <= 0 || input.heightIn < 0 || input.thicknessIn < 0) return { ...ZERO_WALL };

  const heightFt = inchesToFeet(input.heightIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const volumeCy = cubicFtToCy(input.linearFt * heightFt * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}
