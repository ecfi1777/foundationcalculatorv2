/**
 * Steps / Stairs calculator — Spike VM slope-adjusted method
 *
 * A = rise_in × run_in × width_in / 2
 * h = sqrt(rise_in² + run_in²)
 * B = h × width_in × throat_depth_in
 * V1 = (A + B) × (num_steps - 1)
 * V2 = rise_in × run_in × width_in
 * stairs_ft3 = (V1 + V2) × 0.0005787037
 * platform_ft3 = (platformDepthIn/12) × (platformWidthIn/12) × (widthIn/12)
 * volume_cy = (stairs_ft3 + platform_ft3) / 27
 */
import type { StepsInput, StepsResult } from "./types";
import { applyWaste } from "./utils";

export function calcSteps(input: StepsInput): StepsResult {
  const { riseIn, runIn, widthIn, numSteps, throatDepthIn, wastePct } = input;

  const A = riseIn * runIn * widthIn / 2;
  const h = Math.sqrt(riseIn * riseIn + runIn * runIn);
  const B = h * widthIn * throatDepthIn;
  const V1 = (A + B) * (numSteps - 1);
  const V2 = riseIn * runIn * widthIn;
  const stairsFt3 = (V1 + V2) * 0.0005787037;

  let platformFt3 = 0;
  if (input.platformDepthIn && input.platformDepthIn > 0) {
    const platformWidthIn = input.platformWidthIn ?? widthIn;
    platformFt3 = (input.platformDepthIn / 12) * (platformWidthIn / 12) * (widthIn / 12);
  }

  const volumeCy = (stairsFt3 + platformFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, wastePct);

  return { volumeCy, volumeWithWasteCy };
}
