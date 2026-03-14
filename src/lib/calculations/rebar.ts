/**
 * Rebar calculators — Horizontal, Vertical, Slab Grid
 *
 * Horizontal: (linearFt + splice overlap) × numRows
 * Vertical:   numBars × barHeight   (numBars = ceil(linearFt × 12 / spacingIn) + 1)
 * Slab Grid:  lengthwise bars × width + widthwise bars × length + splice overlaps
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
  const spliceExtra = calcSpliceOverlap(input.linearFt, input.barLengthFt, input.overlapIn);
  const perRow = input.linearFt + spliceExtra;
  const totalLf = perRow * input.numRows;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { totalLf, totalWithWasteLf };
}

export function calcRebarVertical(input: RebarVerticalInput): RebarVerticalResult {
  const totalLinearInches = input.linearFt * 12;
  const numBars = Math.ceil(totalLinearInches / input.spacingIn) + 1;
  const barHeightFt = input.barHeightFt + inchesToFeet(input.barHeightIn);
  const totalLf = numBars * (barHeightFt + inchesToFeet(input.overlapIn));
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { numBars, totalLf, totalWithWasteLf };
}

export function calcRebarSlabGrid(input: RebarSlabGridInput): RebarSlabGridResult {
  const lengthIn = input.lengthFt * 12;
  const widthIn = input.widthFt * 12;

  // Bars running lengthwise: spaced across the width
  const barsLengthwise = Math.ceil(widthIn / input.spacingIn) + 1;
  // Bars running widthwise: spaced across the length
  const barsWidthwise = Math.ceil(lengthIn / input.spacingIn) + 1;

  // Each lengthwise bar runs the full length + splice overlap
  const spliceLength = calcSpliceOverlap(input.lengthFt, input.barLengthFt, input.overlapIn);
  const lfLengthwise = barsLengthwise * (input.lengthFt + spliceLength);

  const spliceWidth = calcSpliceOverlap(input.widthFt, input.barLengthFt, input.overlapIn);
  const lfWidthwise = barsWidthwise * (input.widthFt + spliceWidth);

  const totalLf = lfLengthwise + lfWidthwise;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return { barsLengthwise, barsWidthwise, totalLf, totalWithWasteLf };
}
