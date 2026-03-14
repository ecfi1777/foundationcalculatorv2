import { describe, it, expect } from "vitest";
import { calcWall } from "../wall";
import { calcGradeBeam } from "../gradeBeam";

describe("calcWall", () => {
  it("calculates wall volume", () => {
    // 80 LF × 96" height × 8" thick = 80 × 8 × 0.6667 = 426.67 cuft / 27
    const result = calcWall({ linearFt: 80, heightIn: 96, thicknessIn: 8, wastePct: 0 });
    const expected = (80 * (96 / 12) * (8 / 12)) / 27;
    expect(result.volumeCy).toBeCloseTo(expected, 5);
  });

  it("applies waste", () => {
    const result = calcWall({ linearFt: 27, heightIn: 12, thicknessIn: 12, wastePct: 10 });
    expect(result.volumeCy).toBeCloseTo(1, 5);
    expect(result.volumeWithWasteCy).toBeCloseTo(1.1, 5);
  });
});

describe("calcGradeBeam", () => {
  it("calculates grade beam volume", () => {
    // 120 LF × 12" wide × 24" deep = 120 × 1 × 2 = 240 cuft / 27
    const result = calcGradeBeam({ linearFt: 120, widthIn: 12, depthIn: 24, wastePct: 0 });
    expect(result.volumeCy).toBeCloseTo(240 / 27, 5);
  });
});
