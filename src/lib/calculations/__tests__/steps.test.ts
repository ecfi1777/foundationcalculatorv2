import { describe, it, expect } from "vitest";
import { calcSteps } from "../steps";

describe("calcSteps", () => {
  it("calculates steps volume (slope-adjusted)", () => {
    // 3 steps, 36" wide, 7" rise, 11" run, 4" base thickness
    // Step 1: 3 × (11/12) × (1×7/12 + 4/12) = 3 × 0.9167 × 0.9167 = 2.507 cuft
    // Step 2: 3 × 0.9167 × (2×7/12 + 4/12) = 3 × 0.9167 × 1.5 = 4.125 cuft
    // Step 3: 3 × 0.9167 × (3×7/12 + 4/12) = 3 × 0.9167 × 2.0833 = 5.729 cuft
    // Total = 12.361 cuft / 27 = 0.4578 cy
    const result = calcSteps({
      widthIn: 36,
      numSteps: 3,
      riseIn: 7,
      runIn: 11,
      thicknessIn: 4,
      wastePct: 0,
    });
    const w = 36 / 12;
    const run = 11 / 12;
    const rise = 7 / 12;
    const t = 4 / 12;
    let total = 0;
    for (let i = 1; i <= 3; i++) {
      total += w * run * (i * rise + t);
    }
    expect(result.volumeCy).toBeCloseTo(total / 27, 5);
  });

  it("includes platform", () => {
    const result = calcSteps({
      widthIn: 48,
      numSteps: 4,
      riseIn: 7.5,
      runIn: 10,
      thicknessIn: 4,
      platformDepthIn: 36,
      wastePct: 10,
    });
    const w = 48 / 12;
    const run = 10 / 12;
    const rise = 7.5 / 12;
    const t = 4 / 12;
    let cuft = 0;
    for (let i = 1; i <= 4; i++) {
      cuft += w * run * (i * rise + t);
    }
    // Platform
    cuft += w * (36 / 12) * (4 * rise + t);
    const cy = cuft / 27;
    expect(result.volumeCy).toBeCloseTo(cy, 5);
    expect(result.volumeWithWasteCy).toBeCloseTo(cy * 1.1, 5);
  });
});
