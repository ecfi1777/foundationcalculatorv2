/**
 * Steps / Stairs calculator — Spike VM slope-adjusted method
 *
 * Each step is a trapezoidal cross-section accumulated from bottom to top.
 * Step i volume = widthIn/12 × runIn/12 × (sum of rises from step 1..i × riseIn/12 + thicknessIn/12) / 27
 * Platform adds: widthIn/12 × platformDepthIn/12 × (totalRise + thicknessIn/12) / 27
 *
 * The slope-adjusted method accounts for the concrete under each tread
 * following the slope of the stairs, where the thickness follows the
 * underside profile.
 */
import type { StepsInput, StepsResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcSteps(input: StepsInput): StepsResult {
  const widthFt = inchesToFeet(input.widthIn);
  const runFt = inchesToFeet(input.runIn);
  const riseFt = inchesToFeet(input.riseIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);

  let totalCuFt = 0;

  // Each step: the concrete depth at step i = (i * rise) + slab thickness
  for (let i = 1; i <= input.numSteps; i++) {
    const stepDepthFt = i * riseFt + thicknessFt;
    totalCuFt += widthFt * runFt * stepDepthFt;
  }

  // Optional platform/landing at top
  if (input.platformDepthIn && input.platformDepthIn > 0) {
    const platformDepthFt = inchesToFeet(input.platformDepthIn);
    const fullHeightFt = input.numSteps * riseFt + thicknessFt;
    totalCuFt += widthFt * platformDepthFt * fullHeightFt;
  }

  const volumeCy = cubicFtToCy(totalCuFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);

  return { volumeCy, volumeWithWasteCy };
}
