/**
 * Curb & Gutter calculator
 * curb_ft3 = linearFt × inchesToFeet(curbDepthIn) × inchesToFeet(curbHeightIn)
 * gutter_ft3 = linearFt × inchesToFeet(gutterWidthIn) × inchesToFeet(flagThicknessIn)
 * volume_cy = (curb_ft3 + gutter_ft3) / 27
 */
import type { CurbGutterInput, CurbGutterResult } from "./types";
import { inchesToFeet, cubicFtToCy, applyWaste } from "./utils";

const ZERO_CURB: CurbGutterResult = { volumeCy: 0, volumeWithWasteCy: 0 };

export function calcCurbGutter(input: CurbGutterInput): CurbGutterResult {
  if (input.linearFt <= 0 || input.curbDepthIn < 0 || input.curbHeightIn < 0 ||
      input.gutterWidthIn < 0 || input.flagThicknessIn < 0) {
    return { ...ZERO_CURB };
  }

  const curbFt3 = input.linearFt * inchesToFeet(input.curbDepthIn) * inchesToFeet(input.curbHeightIn);
  const gutterFt3 = input.linearFt * inchesToFeet(input.gutterWidthIn) * inchesToFeet(input.flagThicknessIn);
  const volumeCy = cubicFtToCy(curbFt3 + gutterFt3);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);

  return { volumeCy, volumeWithWasteCy };
}
