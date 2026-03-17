/**
 * Cylinder calculator
 * height_ft_total = heightFt + (heightIn/12)
 * radius_ft = (diameterIn/12) / 2
 * volume_ft3 = π × radius_ft² × height_ft_total
 * volume_cy = (volume_ft3 / 27) × quantity
 */
import type { CylinderInput, CylinderResult } from "./types";
import { inchesToFeet, applyWaste } from "./utils";

const ZERO_CYL: CylinderResult = { volumeEachCy: 0, totalVolumeCy: 0, totalWithWasteCy: 0 };

export function calcCylinder(input: CylinderInput): CylinderResult {
  if (input.quantity <= 0 || input.diameterIn <= 0) return { ...ZERO_CYL };
  const heightFtTotal = input.heightFt + inchesToFeet(input.heightIn);
  if (heightFtTotal <= 0) return { ...ZERO_CYL };

  const radiusFt = inchesToFeet(input.diameterIn) / 2;
  const volumeFt3 = Math.PI * radiusFt * radiusFt * heightFtTotal;
  const volumeEachCy = volumeFt3 / 27;
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}
