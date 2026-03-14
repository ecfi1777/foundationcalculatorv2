/**
 * Cylinder calculator
 * height_ft_total = heightFt + (heightIn/12)
 * radius_ft = (diameterIn/12) / 2
 * volume_ft3 = π × radius_ft² × height_ft_total
 * volume_cy = (volume_ft3 / 27) × quantity
 */
import type { CylinderInput, CylinderResult } from "./types";
import { applyWaste } from "./utils";

export function calcCylinder(input: CylinderInput): CylinderResult {
  const heightFtTotal = input.heightFt + input.heightIn / 12;
  const radiusFt = (input.diameterIn / 12) / 2;
  const volumeFt3 = Math.PI * radiusFt * radiusFt * heightFtTotal;
  const volumeEachCy = volumeFt3 / 27;
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}
