import { describe, it, expect } from "vitest";
import { calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid } from "../rebar";

// NOTE: Splice formula corrected from FLOOR(L/bar) to
// max(ceil(L/bar) - 1, 0) — splices only when 2+ bars are required.

describe("calcRebarHorizontal — splice = max(ceil(L/bar) - 1, 0)", () => {
  it("100 LF, 2 rows: ceil(100/20)-1 = 4 splices → overlap 4ft × 2 = 8 → total 208", () => {
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 2, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(208);
  });

  it("15 ft → 0 splices → total = 15", () => {
    const result = calcRebarHorizontal({
      linearFt: 15, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(15);
  });

  it("20 ft → 0 splices → total = 20", () => {
    const result = calcRebarHorizontal({
      linearFt: 20, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(20);
  });

  it("21 ft → 1 splice → total = 22", () => {
    const result = calcRebarHorizontal({
      linearFt: 21, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(22);
  });

  it("40 ft → 1 splice → total = 41", () => {
    const result = calcRebarHorizontal({
      linearFt: 40, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(41);
  });

  it("41 ft → 2 splices → total = 43", () => {
    const result = calcRebarHorizontal({
      linearFt: 41, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(43);
  });

  it("60 ft → 2 splices → total = 62", () => {
    const result = calcRebarHorizontal({
      linearFt: 60, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(62);
  });

  it("25 ft → 1 splice → total = 26", () => {
    const result = calcRebarHorizontal({
      linearFt: 25, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(26);
  });

  it("37 ft → 1 splice → total = 38", () => {
    const result = calcRebarHorizontal({
      linearFt: 37, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(38);
  });

  it("applies waste", () => {
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 5,
    });
    expect(result.totalWithWasteLf).toBeCloseTo(result.totalLf * 1.05);
  });

  it("returns zero for invalid inputs", () => {
    const result = calcRebarHorizontal({
      linearFt: -5, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
    expect(result.totalWithWasteLf).toBe(0);
  });

  it("returns zero when barLengthFt <= 0", () => {
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 1, overlapIn: 12, barLengthFt: 0, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
  });
});

describe("calcRebarVertical — floor, no overlap", () => {
  it("calculates vertical bars", () => {
    const result = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(13);
    expect(result.totalLf).toBeCloseTo(52);
  });

  it("handles partial height", () => {
    const result = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 24, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(6);
    expect(result.totalLf).toBeCloseTo(21);
  });

  it("returns zero for spacingIn <= 0", () => {
    const result = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 0, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(0);
    expect(result.totalLf).toBe(0);
  });
});

describe("calcRebarSlabGrid — splice = max(ceil(L/bar) - 1, 0)", () => {
  it("10×10: no splices either direction", () => {
    // splices: ceil(10/20)-1 = 0 both directions
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(11);
    expect(result.totalLf).toBeCloseTo(220);
  });

  it("30×10: lengthwise needs splice", () => {
    // barsLengthwise = 11, barsWidthwise = 31
    // spliceLength = ceil(30/20)-1 = 1 × 1ft = 1ft
    // spliceWidth  = ceil(10/20)-1 = 0
    // lfLengthwise = 11 × (30 + 1) = 341
    // lfWidthwise  = 31 × 10 = 310
    // total = 651
    const result = calcRebarSlabGrid({
      lengthFt: 30, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(651);
  });

  it("40×10 exact multiple → 1 splice (not 2)", () => {
    // spliceLength = ceil(40/20)-1 = 1 × 1ft = 1ft
    // barsLengthwise = 11, barsWidthwise = 41
    // lfLengthwise = 11 × 41 = 451
    // lfWidthwise  = 41 × 10 = 410
    // total = 861
    const result = calcRebarSlabGrid({
      lengthFt: 40, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(861);
  });

  it("41×10 → 2 splices lengthwise", () => {
    // spliceLength = ceil(41/20)-1 = 2 × 1ft = 2ft
    // barsLengthwise = floor(10*12/12)+1 = 11
    // barsWidthwise  = floor(41*12/12)+1 = 42
    // lfLengthwise = 11 × (41 + 2) = 473
    // lfWidthwise  = 42 × 10 = 420
    // total = 893
    const result = calcRebarSlabGrid({
      lengthFt: 41, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(893);
  });

  it("25×16 @ 18in non-even", () => {
    // barsLengthwise = floor(16*12/18)+1 = 11
    // barsWidthwise  = floor(25*12/18)+1 = 17
    // spliceLength = ceil(25/20)-1 = 1 × 1ft = 1ft → 26ft
    // spliceWidth  = ceil(16/20)-1 = 0 → 16ft
    // lfLengthwise = 11 × 26 = 286
    // lfWidthwise  = 17 × 16 = 272
    // total = 558
    const result = calcRebarSlabGrid({
      lengthFt: 25, widthFt: 16, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(17);
    expect(result.totalLf).toBeCloseTo(558);
  });

  it("returns zero for invalid inputs", () => {
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 0,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
  });
});
