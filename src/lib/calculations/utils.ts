/**
 * Calculation Engine — Shared Utilities
 * Pure functions, zero UI imports.
 */

import type { ImperialLength } from "./types";

/** Fraction string → decimal value */
const FRACTION_MAP: Record<string, number> = {
  "0": 0,
  "1/16": 1 / 16,
  "1/8": 1 / 8,
  "3/16": 3 / 16,
  "1/4": 1 / 4,
  "5/16": 5 / 16,
  "3/8": 3 / 8,
  "7/16": 7 / 16,
  "1/2": 1 / 2,
  "9/16": 9 / 16,
  "5/8": 5 / 8,
  "11/16": 11 / 16,
  "3/4": 3 / 4,
  "13/16": 13 / 16,
  "7/8": 7 / 8,
  "15/16": 15 / 16,
};

/**
 * Convert an ImperialLength (feet + inches + fraction string) to total inches.
 * @param length - Object with feet (number), inches (number), fraction (string like "1/4")
 * @returns Total length in decimal inches
 */
export function toTotalInches(length: ImperialLength): number {
  const fractionVal = FRACTION_MAP[length.fraction] ?? 0;
  return length.feet * 12 + length.inches + fractionVal;
}

/**
 * Convert inches to feet.
 * @param inches - Value in inches
 * @returns Value in decimal feet
 */
export function inchesToFeet(inches: number): number {
  return inches / 12;
}

/**
 * Convert cubic feet to cubic yards.
 * @param cubicFt - Volume in cubic feet
 * @returns Volume in cubic yards
 */
export function cubicFtToCy(cubicFt: number): number {
  return cubicFt / 27;
}

/**
 * Apply a waste percentage to a value.
 * @param value - Base value (any unit)
 * @param wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns value × (1 + wastePct/100)
 */
export function applyWaste(value: number, wastePct: number): number {
  return value * (1 + wastePct / 100);
}

/**
 * Calculate total splice overlap length for a rebar run.
 * Per spec: splices = FLOOR(totalLengthFt / barLengthFt)
 * Each splice adds `overlapIn` inches of extra rebar.
 * @param totalLengthFt - Total run length in feet
 * @param barLengthFt - Standard bar length in feet
 * @param overlapIn - Overlap per splice in inches
 * @returns Total splice overlap in feet
 */
export function calcSpliceOverlap(
  totalLengthFt: number,
  barLengthFt: number,
  overlapIn: number
): number {
  if (totalLengthFt <= 0 || barLengthFt <= 0) return 0;
  const splices = Math.floor(totalLengthFt / barLengthFt);
  return splices * inchesToFeet(overlapIn);
}
