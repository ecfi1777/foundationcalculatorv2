/**
 * Grade Beam calculator
 * Same formula as footing: linearFt × (widthIn/12) × (depthIn/12) / 27
 */
import type { GradeBeamInput, GradeBeamResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_GB: GradeBeamResult = { volumeCy: 0, volumeWithWasteCy: 0 };

export function calcGradeBeam(input: GradeBeamInput): GradeBeamResult {
  if (input.linearFt <= 0 || input.widthIn < 0 || input.depthIn < 0) return { ...ZERO_GB };

  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}
