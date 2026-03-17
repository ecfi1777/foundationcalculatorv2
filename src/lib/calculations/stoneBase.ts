/**
 * Stone Base calculator
 * Volume: sqft × (depthIn/12) / 27  →  tons = volumeCy × densityTonsPerCy
 */
import type { StoneBaseInput, StoneBaseResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

const ZERO_STONE: StoneBaseResult = { volumeCy: 0, tons: 0, tonsWithWaste: 0 };

/**
 * Calculate stone base volume and tonnage.
 * @param input.sqft - Area in square feet
 * @param input.depthIn - Stone depth in inches
 * @param input.densityTonsPerCy - Stone density in tons per cubic yard
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns volumeCy in cubic yards, tons, tonsWithWaste with waste applied
 */
export function calcStoneBase(input: StoneBaseInput): StoneBaseResult {
  if (input.sqft <= 0 || input.depthIn < 0 || input.densityTonsPerCy <= 0) return { ...ZERO_STONE };

  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.sqft * depthFt);
  const tons = volumeCy * input.densityTonsPerCy;
  const tonsWithWaste = applyWaste(tons, input.wastePct);
  return { volumeCy, tons, tonsWithWaste };
}
