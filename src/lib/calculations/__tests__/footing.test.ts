import { describe, it, expect } from "vitest";
import { calcFooting } from "../footing";

describe("calcFooting", () => {
  it("calculates basic footing volume", () => {
    // 100 LF × 24" wide × 12" deep = 100 × 2 × 1 = 200 cuft / 27 = 7.407 cy
    const result = calcFooting({
      linearFt: 100,
      widthIn: 24,
      depthIn: 12,
      wastePct: 0,
    });
    expect(result.footingVolumeCy).toBeCloseTo(200 / 27, 5);
    expect(result.wallVolumeCy).toBeNull();
    expect(result.totalVolumeCy).toBeCloseTo(200 / 27, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(200 / 27, 5);
  });

  it("calculates footing with wall add-on", () => {
    // Footing: 50 LF × 18" × 8" = 50 × 1.5 × 0.6667 = 50 cuft / 27
    // Wall: 50 LF × 8" thick × 48" tall = 50 × 0.6667 × 4 = 133.33 cuft / 27
    const result = calcFooting({
      linearFt: 50,
      widthIn: 18,
      depthIn: 8,
      wastePct: 5,
      wall: { heightIn: 48, thicknessIn: 8 },
    });
    const footingCuFt = 50 * (18 / 12) * (8 / 12);
    const wallCuFt = 50 * (8 / 12) * (48 / 12);
    expect(result.footingVolumeCy).toBeCloseTo(footingCuFt / 27, 5);
    expect(result.wallVolumeCy).toBeCloseTo(wallCuFt / 27, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(
      ((footingCuFt + wallCuFt) / 27) * 1.05,
      5
    );
  });

  it("applies waste correctly", () => {
    const result = calcFooting({
      linearFt: 27,
      widthIn: 12,
      depthIn: 12,
      wastePct: 10,
    });
    // 27 × 1 × 1 = 27 cuft = 1 cy → with 10% waste = 1.1
    expect(result.totalVolumeCy).toBeCloseTo(1, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(1.1, 5);
  });
});
