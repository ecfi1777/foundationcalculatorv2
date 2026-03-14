/**
 * Cylinder calculator
 * Volume each: π × (diameterIn/2/12)² × (heightIn/12) / 27
 */
import type { CylinderInput, CylinderResult } from "./types";
import { cubicFtToCy, inchesToFeet, applyWaste } from "./utils";

export function calcCylinder(input: CylinderInput): CylinderResult {
  const radiusFt = inchesToFeet(input.diameterIn / 2);
  const heightFt = inchesToFeet(input.heightIn);
  const volumeEachCy = cubicFtToCy(Math.PI * radiusFt * radiusFt * heightFt);
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}
