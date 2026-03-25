import { describe, it, expect } from "vitest";
import { calcSlabSection, calcSlabArea } from "../slab";

describe("calcSlabSection", () => {
  it("calculates section sqft and volume", () => {
    const result = calcSlabSection({
      lengthFt: 20, lengthIn: 0,
      widthFt: 30, widthIn: 0,
      thicknessIn: 4, wastePct: 0,
    });
    expect(result.sqft).toBeCloseTo(600);
    expect(result.volumeCy).toBeCloseTo(200 / 27, 5);
    expect(result.volumeWithWasteCy).toBeCloseTo(200 / 27, 5);
  });

  it("handles partial inches", () => {
    const result = calcSlabSection({
      lengthFt: 10, lengthIn: 6,
      widthFt: 10, widthIn: 6,
      thicknessIn: 6, wastePct: 0,
    });
    expect(result.sqft).toBeCloseTo(110.25);
    expect(result.volumeCy).toBeCloseTo((110.25 * 0.5) / 27, 5);
  });
});

describe("calcSlabArea", () => {
  it("sums sections with per-section waste", () => {
    const result = calcSlabArea({
      sections: [
        { lengthFt: 10, lengthIn: 0, widthFt: 10, widthIn: 0, thicknessIn: 4, wastePct: 5 },
        { lengthFt: 20, lengthIn: 0, widthFt: 20, widthIn: 0, thicknessIn: 4, wastePct: 10 },
      ],
    });
    expect(result.sections).toHaveLength(2);
    expect(result.totalSqft).toBeCloseTo(500);
    const vol1 = (100 * (4 / 12)) / 27;
    const vol2 = (400 * (4 / 12)) / 27;
    expect(result.totalVolumeCy).toBeCloseTo(vol1 + vol2, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(vol1 * 1.05 + vol2 * 1.10, 5);
  });
});
