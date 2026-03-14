/**
 * Curb & Gutter calculator
 * Cross-section = flag + curb + gutter areas, then × linearFt / 27
 */
import type { CurbGutterInput, CurbGutterResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcCurbGutter(input: CurbGutterInput): CurbGutterResult {
  // Cross-section areas in sq inches
  const flagArea = input.flagHeightIn * input.flagDepthIn;
  const curbArea = input.curbHeightIn * input.curbDepthIn;
  const gutterArea = input.gutterWidthIn * input.gutterThicknessIn;
  const totalCrossSectionSqIn = flagArea + curbArea + gutterArea;

  // Convert to sq ft (÷ 144), then × linearFt for cubic ft
  const crossSectionSqFt = totalCrossSectionSqIn / 144;
  const volumeCy = cubicFtToCy(crossSectionSqFt * input.linearFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);

  return { volumeCy, volumeWithWasteCy };
}
