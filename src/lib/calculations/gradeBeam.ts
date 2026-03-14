/**
 * Grade Beam calculator
 * Same formula as footing: linearFt × (widthIn/12) × (depthIn/12) / 27
 */
import type { GradeBeamInput, GradeBeamResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcGradeBeam(input: GradeBeamInput): GradeBeamResult {
  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}
