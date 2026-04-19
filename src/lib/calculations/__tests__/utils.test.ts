import { describe, it, expect } from "vitest";
import {
  toTotalInches,
  inchesToFeet,
  cubicFtToCy,
  applyWaste,
  calcSpliceOverlap,
} from "../utils";

describe("utils", () => {
  it("toTotalInches converts correctly", () => {
    expect(toTotalInches({ feet: 2, inches: 6, fraction: "1/2" })).toBeCloseTo(30.5);
    expect(toTotalInches({ feet: 0, inches: 0, fraction: "0" })).toBe(0);
    expect(toTotalInches({ feet: 1, inches: 0, fraction: "0" })).toBe(12);
  });

  it("inchesToFeet", () => {
    expect(inchesToFeet(12)).toBe(1);
    expect(inchesToFeet(6)).toBe(0.5);
  });

  it("cubicFtToCy", () => {
    expect(cubicFtToCy(27)).toBe(1);
    expect(cubicFtToCy(54)).toBe(2);
  });

  it("applyWaste", () => {
    expect(applyWaste(10, 10)).toBeCloseTo(11);
    expect(applyWaste(10, 0)).toBe(10);
    expect(applyWaste(100, 5)).toBeCloseTo(105);
  });

  describe("calcSpliceOverlap — max(ceil(L/bar) - 1, 0)", () => {
    // Corrects prior spec: splices only when 2+ bars required.
    it("15 ft → 0 splices (single bar)", () => {
      expect(calcSpliceOverlap(15, 20, 12)).toBe(0);
    });
    it("20 ft → 0 splices (exactly one bar)", () => {
      expect(calcSpliceOverlap(20, 20, 12)).toBe(0);
    });
    it("21 ft → 1 splice", () => {
      expect(calcSpliceOverlap(21, 20, 12)).toBeCloseTo(1);
    });
    it("40 ft → 1 splice (two bars, one joint)", () => {
      expect(calcSpliceOverlap(40, 20, 12)).toBeCloseTo(1);
    });
    it("41 ft → 2 splices", () => {
      expect(calcSpliceOverlap(41, 20, 12)).toBeCloseTo(2);
    });
    it("60 ft → 2 splices", () => {
      expect(calcSpliceOverlap(60, 20, 12)).toBeCloseTo(2);
    });
    it("0 ft → 0", () => {
      expect(calcSpliceOverlap(0, 20, 12)).toBe(0);
    });
  });
});
