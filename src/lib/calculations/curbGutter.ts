/**
 * Curb & Gutter calculator
 * curb_ft3 = linearFt × (curbDepthIn/12) × (curbHeightIn/12)
 * gutter_ft3 = linearFt × (gutterWidthIn/12) × (flagThicknessIn/12)
 * volume_cy = (curb_ft3 + gutter_ft3) / 27
 */
import type { CurbGutterInput, CurbGutterResult } from "./types";
import { applyWaste } from "./utils";

export function calcCurbGutter(input: CurbGutterInput): CurbGutterResult {
  const curbFt3 = input.linearFt * (input.curbDepthIn / 12) * (input.curbHeightIn / 12);
  const gutterFt3 = input.linearFt * (input.gutterWidthIn / 12) * (input.flagThicknessIn / 12);
  const volumeCy = (curbFt3 + gutterFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);

  return { volumeCy, volumeWithWasteCy };
}
