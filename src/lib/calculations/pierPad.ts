/**
 * Pier Pad calculator
 * Volume each: (lengthIn/12) × (widthIn/12) × (depthIn/12) / 27
 */
import type { PierPadInput, PierPadResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_PP: PierPadResult = { volumeEachCy: 0, totalVolumeCy: 0, totalWithWasteCy: 0 };

/**
 * Calculate pier/pad concrete volume for one or more identical pads.
 * @param input.lengthIn - Pad length in inches
 * @param input.widthIn - Pad width in inches
 * @param input.depthIn - Pad depth in inches
 * @param input.quantity - Number of identical pads
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns volumeEachCy per pad in cubic yards, totalVolumeCy, totalWithWasteCy
 */
export function calcPierPad(input: PierPadInput): PierPadResult {
  if (input.quantity <= 0 || input.lengthIn < 0 || input.widthIn < 0 || input.depthIn < 0) {
    return { ...ZERO_PP };
  }

  const lFt = inchesToFeet(input.lengthIn);
  const wFt = inchesToFeet(input.widthIn);
  const dFt = inchesToFeet(input.depthIn);
  const volumeEachCy = cubicFtToCy(lFt * wFt * dFt);
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}
