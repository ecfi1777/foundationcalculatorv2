/**
 * Footing calculator (+ optional wall add-on)
 * Formula: linearFt × (widthIn/12) × (depthIn/12) / 27
 */
import type { FootingInput, FootingResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_FOOTING: FootingResult = { footingVolumeCy: 0, wallVolumeCy: null, totalVolumeCy: 0, totalWithWasteCy: 0 };

export function calcFooting(input: FootingInput): FootingResult {
  if (input.linearFt <= 0 || input.widthIn < 0 || input.depthIn < 0) return { ...ZERO_FOOTING };

  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const footingVolumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);

  let wallVolumeCy: number | null = null;
  if (input.wall) {
    if (input.wall.heightIn < 0 || input.wall.thicknessIn < 0) return { ...ZERO_FOOTING };
    const wallHeightFt = inchesToFeet(input.wall.heightIn);
    const wallThicknessFt = inchesToFeet(input.wall.thicknessIn);
    wallVolumeCy = cubicFtToCy(input.linearFt * wallThicknessFt * wallHeightFt);
  }

  const totalVolumeCy = footingVolumeCy + (wallVolumeCy ?? 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);

  return { footingVolumeCy, wallVolumeCy, totalVolumeCy, totalWithWasteCy };
}
