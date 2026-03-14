/**
 * Rebar calculators — Horizontal, Vertical, Slab Grid
 */
import type {
  RebarHorizontalInput,
  RebarHorizontalResult,
  RebarVerticalInput,
  RebarVerticalResult,
  RebarSlabGridInput,
  RebarSlabGridResult,
} from "./types";
import { inchesToFeet, applyWaste, calcSpliceOverlap } from "./utils";

export function calcRebarHorizontal(input: RebarHorizontalInput): RebarHorizontalResult {
  // num_splices = floor(linearFt / 20)
  const numSplices = Math.floor(input.linearFt / input.barLengthFt);
  const overlapLf = numSplices * inchesToFeet(input.overlapIn) * input.numRows;
  const totalLf = (input.linearFt * input.numRows) + overlapLf;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { totalLf, totalWithWasteLf };
}

export function calcRebarVertical(input: RebarVerticalInput): RebarVerticalResult {
  // num_bars = floor(linearFt × 12 / spacingIn) + 1
  const numBars = Math.floor(input.linearFt * 12 / input.spacingIn) + 1;
  // bar_h_ft = barHeightFt + (barHeightIn/12)  — NO overlap added
  const barHeightFt = input.barHeightFt + inchesToFeet(input.barHeightIn);
  const totalLf = numBars * barHeightFt;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { numBars, totalLf, totalWithWasteLf };
}

export function calcRebarSlabGrid(input: RebarSlabGridInput): RebarSlabGridResult {
  const lengthIn = input.lengthFt * 12;
  const widthIn = input.widthFt * 12;

  const barsLengthwise = Math.floor(widthIn / input.spacingIn) + 1;
  const barsWidthwise = Math.floor(lengthIn / input.spacingIn) + 1;

  const spliceLength = calcSpliceOverlap(input.lengthFt, input.barLengthFt, input.overlapIn);
  const lfLengthwise = barsLengthwise * (input.lengthFt + spliceLength);

  const spliceWidth = calcSpliceOverlap(input.widthFt, input.barLengthFt, input.overlapIn);
  const lfWidthwise = barsWidthwise * (input.widthFt + spliceWidth);

  const totalLf = lfLengthwise + lfWidthwise;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return { barsLengthwise, barsWidthwise, totalLf, totalWithWasteLf };
}
