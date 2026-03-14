/**
 * Wall standalone calculator
 * Formula: linearFt × (heightIn/12) × (thicknessIn/12) / 27
 */
import type { WallInput, WallResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcWall(input: WallInput): WallResult {
  const heightFt = inchesToFeet(input.heightIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const volumeCy = cubicFtToCy(input.linearFt * heightFt * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}
