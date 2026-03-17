/**
 * Steps / Stairs calculator — Spike VM slope-adjusted method
 *
 * A = rise_in × run_in × width_in / 2
 * h = sqrt(rise_in² + run_in²)
 * B = h × width_in × throat_depth_in
 * V1 = (A + B) × (num_steps - 1)
 * V2 = rise_in × run_in × width_in
 * stairs_ft3 = (V1 + V2) × CUBIC_IN_TO_FT3
 * platform_ft3 = (platformDepthIn/12) × (platformWidthIn/12) × (widthIn/12)
 * volume_cy = (stairs_ft3 + platform_ft3) / 27
 */
import type { StepsInput, StepsResult } from "./types";
import { inchesToFeet, applyWaste } from "./utils";

// 1/1728 — converts cubic inches to cubic feet (12^3 = 1728)
const CUBIC_IN_TO_FT3 = 0.0005787037;

const ZERO_STEPS: StepsResult = { volumeCy: 0, volumeWithWasteCy: 0 };

/**
 * Calculate steps/stairs concrete volume using the slope-adjusted method.
 * @param input.riseIn - Step rise in inches
 * @param input.runIn - Step run (tread depth) in inches
 * @param input.widthIn - Stair width in inches
 * @param input.numSteps - Number of steps
 * @param input.throatDepthIn - Minimum slab thickness under the nosing, in inches
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @param input.platformDepthIn - Optional platform slab depth in inches
 * @param input.platformWidthIn - Optional platform width in inches (defaults to widthIn)
 * @returns volumeCy in cubic yards, volumeWithWasteCy with waste applied
 */
export function calcSteps(input: StepsInput): StepsResult {
  const { riseIn, runIn, widthIn, numSteps, throatDepthIn, wastePct } = input;

  if (riseIn <= 0 || runIn <= 0 || widthIn <= 0 || numSteps <= 0 || throatDepthIn < 0) {
    return { ...ZERO_STEPS };
  }

  const A = riseIn * runIn * widthIn / 2;
  const h = Math.sqrt(riseIn * riseIn + runIn * runIn);
  const B = h * widthIn * throatDepthIn;
  const V1 = (A + B) * (numSteps - 1);
  const V2 = riseIn * runIn * widthIn;
  const stairsFt3 = (V1 + V2) * CUBIC_IN_TO_FT3;

  let platformFt3 = 0;
  if (input.platformDepthIn && input.platformDepthIn > 0) {
    const platformWidthIn = input.platformWidthIn ?? widthIn;
    platformFt3 = inchesToFeet(input.platformDepthIn) * inchesToFeet(platformWidthIn) * inchesToFeet(widthIn);
  }

  const volumeCy = (stairsFt3 + platformFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, wastePct);

  return { volumeCy, volumeWithWasteCy };
}
