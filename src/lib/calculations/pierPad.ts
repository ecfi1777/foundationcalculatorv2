/**
 * Pier Pad calculator
 * Volume each: (lengthIn/12) × (widthIn/12) × (depthIn/12) / 27
 */
import type { PierPadInput, PierPadResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcPierPad(input: PierPadInput): PierPadResult {
  const lFt = inchesToFeet(input.lengthIn);
  const wFt = inchesToFeet(input.widthIn);
  const dFt = inchesToFeet(input.depthIn);
  const volumeEachCy = cubicFtToCy(lFt * wFt * dFt);
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}
