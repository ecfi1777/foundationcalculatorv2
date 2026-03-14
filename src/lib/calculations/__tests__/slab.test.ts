import { describe, it, expect } from "vitest";
import { calcSlabSection, calcSlabArea } from "../slab";

describe("calcSlabSection", () => {
  it("calculates section sqft and volume", () => {
    // 20'0" × 30'0" × 4" thick
    // sqft = 600, volume = 600 × (4/12) / 27 = 7.407 cy
    const result = calcSlabSection({
      lengthFt: 20, lengthIn: 0,
      widthFt: 30, widthIn: 0,
      thicknessIn: 4,
    });
    expect(result.sqft).toBeCloseTo(600);
    expect(result.volumeCy).toBeCloseTo(200 / 27, 5);
  });

  it("handles partial inches", () => {
    // 10'6" × 10'6" × 6" = 10.5 × 10.5 × 0.5 / 27
    const result = calcSlabSection({
      lengthFt: 10, lengthIn: 6,
      widthFt: 10, widthIn: 6,
      thicknessIn: 6,
    });
    expect(result.sqft).toBeCloseTo(110.25);
    expect(result.volumeCy).toBeCloseTo((110.25 * 0.5) / 27, 5);
  });
});

describe("calcSlabArea", () => {
  it("sums sections and applies waste", () => {
    const result = calcSlabArea({
      sections: [
        { lengthFt: 10, lengthIn: 0, widthFt: 10, widthIn: 0, thicknessIn: 4 },
        { lengthFt: 20, lengthIn: 0, widthFt: 20, widthIn: 0, thicknessIn: 4 },
      ],
      wastePct: 5,
    });
    expect(result.sections).toHaveLength(2);
    expect(result.totalSqft).toBeCloseTo(500);
    const expectedVol = (100 * (4 / 12) + 400 * (4 / 12)) / 27;
    expect(result.totalVolumeCy).toBeCloseTo(expectedVol, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(expectedVol * 1.05, 5);
  });
});
