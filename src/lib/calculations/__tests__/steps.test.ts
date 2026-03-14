import { describe, it, expect } from "vitest";
import { calcSteps } from "../steps";

describe("calcSteps — Spike VM formula", () => {
  it("calculates steps volume with exact Spike VM formula", () => {
    // 3 steps, 36" wide, 7" rise, 11" run, 4" throat depth
    const input = {
      widthIn: 36, numSteps: 3, riseIn: 7, runIn: 11,
      throatDepthIn: 4, wastePct: 0,
    };
    const A = 7 * 11 * 36 / 2; // 1386
    const h = Math.sqrt(7 * 7 + 11 * 11); // 13.0384
    const B = h * 36 * 4; // 1877.53
    const V1 = (A + B) * (3 - 1); // 6527.06
    const V2 = 7 * 11 * 36; // 2772
    const stairsFt3 = (V1 + V2) * 0.0005787037;
    const expectedCy = stairsFt3 / 27;
    const result = calcSteps(input);
    expect(result.volumeCy).toBeCloseTo(expectedCy, 5);
  });

  it("includes platform", () => {
    const input = {
      widthIn: 48, numSteps: 4, riseIn: 7.5, runIn: 10,
      throatDepthIn: 4, platformDepthIn: 36, wastePct: 10,
    };
    const A = 7.5 * 10 * 48 / 2;
    const h = Math.sqrt(7.5 * 7.5 + 10 * 10);
    const B = h * 48 * 4;
    const V1 = (A + B) * (4 - 1);
    const V2 = 7.5 * 10 * 48;
    const stairsFt3 = (V1 + V2) * 0.0005787037;
    // platform: (36/12) × (48/12) × (48/12) = 3 × 4 × 4 = 48 cuft
    const platformFt3 = (36 / 12) * (48 / 12) * (48 / 12);
    const cy = (stairsFt3 + platformFt3) / 27;
    const result = calcSteps(input);
    expect(result.volumeCy).toBeCloseTo(cy, 5);
    expect(result.volumeWithWasteCy).toBeCloseTo(cy * 1.1, 5);
  });

  it("supports separate platform width", () => {
    const input = {
      widthIn: 48, numSteps: 2, riseIn: 7, runIn: 11,
      throatDepthIn: 4, platformDepthIn: 24, platformWidthIn: 60, wastePct: 0,
    };
    const A = 7 * 11 * 48 / 2;
    const h = Math.sqrt(49 + 121);
    const B = h * 48 * 4;
    const V1 = (A + B) * 1;
    const V2 = 7 * 11 * 48;
    const stairsFt3 = (V1 + V2) * 0.0005787037;
    const platformFt3 = (24 / 12) * (60 / 12) * (48 / 12);
    const cy = (stairsFt3 + platformFt3) / 27;
    const result = calcSteps(input);
    expect(result.volumeCy).toBeCloseTo(cy, 5);
  });
});
