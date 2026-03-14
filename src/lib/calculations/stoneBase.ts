/**
 * Stone Base calculator
 * Volume: sqft × (depthIn/12) / 27  →  tons = volumeCy × densityTonsPerCy
 */
import type { StoneBaseInput, StoneBaseResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcStoneBase(input: StoneBaseInput): StoneBaseResult {
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.sqft * depthFt);
  const tons = volumeCy * input.densityTonsPerCy;
  const tonsWithWaste = applyWaste(tons, input.wastePct);
  return { volumeCy, tons, tonsWithWaste };
}
