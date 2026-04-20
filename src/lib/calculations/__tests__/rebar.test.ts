/**
 * Rebar engine — v2.3 test suite
 *
 * Tests import from @/lib/calculations (the barrel) which re-exports from
 * shared/calculations/index.ts — the live UI production code path.
 *
 * Every numeric expectation here is drawn DIRECTLY from the v2.3 Master Spec
 * worked examples. Do not change an expected value without updating the spec
 * first.
 *
 * Spec references:
 *   §8 Shared Primitives       — calcPieceCount + Horizontal inset examples
 *   §8.9  Rebar Horizontal      — Scenario B splice + inset
 *   §8.10 Rebar Vertical        — Scenario B splice on per-position height
 *   §8.11 Rebar Slab Grid       — Scenario B splice + inset on both axes
 *   §8.12 Rebar L-Bar (NEW)     — Scenario B splice on vertical leg + bend
 */
import { describe, it, expect } from "vitest";
import {
  calcPieceCount,
  calcRebarHorizontal,
  calcRebarVertical,
  calcRebarSlabGrid,
  calcRebarLBar,
} from "@/lib/calculations";

// ────────────────────────────────────────────────────────────────────────────
// calcPieceCount — the Scenario B primitive
// bar_length = 20, overlap = 1 ft throughout
// ────────────────────────────────────────────────────────────────────────────
describe("calcPieceCount — Scenario B, overlap inside the run", () => {
  it("run fits in one bar → 1 piece (no splices)", () => {
    expect(calcPieceCount(14.5, 20, 1)).toBe(1);
    expect(calcPieceCount(19.5, 20, 1)).toBe(1);
    expect(calcPieceCount(20.0, 20, 1)).toBe(1);
  });

  it("39.5 ft run → 3 pieces (2 splices) — ceil(38.5/19) = 3", () => {
    expect(calcPieceCount(39.5, 20, 1)).toBe(3);
  });

  it("59.5 ft run → 4 pieces (3 splices) — ceil(58.5/19) = 4", () => {
    expect(calcPieceCount(59.5, 20, 1)).toBe(4);
  });

  it("21 ft with 12 in overlap → 2 pieces — ceil(20/19) = 2", () => {
    expect(calcPieceCount(21, 20, 1)).toBe(2);
  });

  it("returns 0 for invalid input", () => {
    expect(calcPieceCount(0, 20, 1)).toBe(0);
    expect(calcPieceCount(-5, 20, 1)).toBe(0);
    expect(calcPieceCount(20, 0, 1)).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// calcRebarHorizontal — §8.9 + §8 Shared Primitives worked examples
// bar=20 ft, overlap=12 in, inset=3 in/end (inset_ft=0.25, so steel is run−0.5)
// ────────────────────────────────────────────────────────────────────────────
describe("calcRebarHorizontal — v2.3 Scenario B + 3\" inset", () => {
  const base = { numRows: 1, overlapIn: 12, barLengthFt: 20, insetIn: 3, wastePct: 0 };

  it("15 ft concrete run → L_steel=14.5 → 1 piece → 20 LF, 0 splices", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 15 });
    expect(r.totalLf).toBe(20);
    expect(r.piecesTotal).toBe(1);
    expect(r.splicesPerRow).toBe(0);
  });

  it("20 ft concrete run → L_steel=19.5 → 1 piece → 20 LF, 0 splices", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 20 });
    expect(r.totalLf).toBe(20);
    expect(r.piecesTotal).toBe(1);
    expect(r.splicesPerRow).toBe(0);
  });

  it("20 ft 6 in (20.5 ft) concrete run → L_steel=20.0 → 1 piece (inset saves a splice)", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 20.5 });
    expect(r.totalLf).toBe(20);
    expect(r.piecesTotal).toBe(1);
    expect(r.splicesPerRow).toBe(0);
  });

  it("40 ft concrete run → L_steel=39.5 → 3 pieces → 60 LF, 2 splices", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 40 });
    expect(r.totalLf).toBe(60);
    expect(r.piecesTotal).toBe(3);
    expect(r.splicesPerRow).toBe(2);
  });

  it("60 ft concrete run → L_steel=59.5 → 4 pieces → 80 LF, 3 splices", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 60 });
    expect(r.totalLf).toBe(80);
    expect(r.piecesTotal).toBe(4);
    expect(r.splicesPerRow).toBe(3);
  });

  it("multiple rows multiply piece count", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 40, numRows: 3 });
    expect(r.totalLf).toBe(180);
    expect(r.piecesTotal).toBe(9);
    expect(r.splicesPerRow).toBe(2);
  });

  it("applies waste to totalLf", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 40, wastePct: 5 });
    expect(r.totalWithWasteLf).toBeCloseTo(60 * 1.05, 5);
  });

  it("insetIn defaults to 3 when not passed", () => {
    const withDefault = calcRebarHorizontal({
      linearFt: 40, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    const withExplicit = calcRebarHorizontal({ ...base, linearFt: 40 });
    expect(withDefault.totalLf).toBe(withExplicit.totalLf);
    expect(withDefault.piecesTotal).toBe(withExplicit.piecesTotal);
  });

  it("insetIn=0 (no inset) restores full run as steel — 40 ft stays needing 3 pieces", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 40, insetIn: 0 });
    expect(r.piecesTotal).toBe(3);
    expect(r.totalLf).toBe(60);
  });

  it("inset larger than half the run → zero return (validation case)", () => {
    const r = calcRebarHorizontal({ ...base, linearFt: 0.4, insetIn: 3 });
    expect(r.totalLf).toBe(0);
    expect(r.piecesTotal).toBe(0);
  });

  it("returns zero for invalid inputs", () => {
    expect(calcRebarHorizontal({ ...base, linearFt: -1 }).totalLf).toBe(0);
    expect(calcRebarHorizontal({ ...base, linearFt: 40, numRows: 0 }).totalLf).toBe(0);
    expect(calcRebarHorizontal({ ...base, linearFt: 40, barLengthFt: 0 }).totalLf).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// calcRebarVertical — §8.10
// Every position charged a full 20 ft bar; splice if bar_height > bar_length
// ────────────────────────────────────────────────────────────────────────────
describe("calcRebarVertical — v2.3 full-bar charge + Scenario B on tall walls", () => {
  it("50 ft run × 48 in spacing × 4 ft height → 13 positions × 20 LF = 260 LF", () => {
    const r = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(r.numBars).toBe(13);
    expect(r.totalLf).toBe(260);
    expect(r.piecesTotal).toBe(13);
  });

  it("10 ft run × 24 in spacing × 3 ft 6 in height → 6 positions × 20 LF = 120 LF", () => {
    const r = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 24, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(r.numBars).toBe(6);
    expect(r.totalLf).toBe(120);
    expect(r.piecesTotal).toBe(6);
  });

  it("40 ft run × 16 in spacing × 20 ft wall vertical → 31 positions, no splice", () => {
    const r = calcRebarVertical({
      linearFt: 40, barHeightFt: 20, barHeightIn: 0,
      spacingIn: 16, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(r.numBars).toBe(31);
    expect(r.totalLf).toBe(620);
    expect(r.piecesTotal).toBe(31);
  });

  it("40 ft run × 16 in spacing × 22 ft wall vertical → 31 positions, each needs 2 pieces = 1240 LF", () => {
    const r = calcRebarVertical({
      linearFt: 40, barHeightFt: 22, barHeightIn: 0,
      spacingIn: 16, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(r.numBars).toBe(31);
    expect(r.totalLf).toBe(1240);
    expect(r.piecesTotal).toBe(62);
  });

  it("barLengthFt defaults to 20 when not passed", () => {
    const withDefault = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, wastePct: 0,
    });
    expect(withDefault.totalLf).toBe(260);
    expect(withDefault.piecesTotal).toBe(13);
  });

  it("applies waste", () => {
    const r = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, barLengthFt: 20, wastePct: 5,
    });
    expect(r.totalWithWasteLf).toBeCloseTo(260 * 1.05, 5);
  });

  it("returns zero for invalid inputs", () => {
    const bad = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 0, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(bad.numBars).toBe(0);
    expect(bad.totalLf).toBe(0);
    expect(bad.piecesTotal).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// calcRebarSlabGrid — §8.11
// ────────────────────────────────────────────────────────────────────────────
describe("calcRebarSlabGrid — v2.3 Scenario B + 3\" inset on both axes", () => {
  it("Spec worked example: 16×10 slab, 18\" spacing, 3\" inset → 378 LF (5% waste), 18 pieces", () => {
    const r = calcRebarSlabGrid({
      lengthFt: 16, widthFt: 10, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, insetIn: 3, wastePct: 5,
    });
    expect(r.barsLengthwise).toBe(7);
    expect(r.barsWidthwise).toBe(11);
    expect(r.totalLf).toBe(360);
    expect(r.totalWithWasteLf).toBeCloseTo(378, 5);
    expect(r.piecesTotal).toBe(18);
  });

  it("50×30 slab, 12\" spacing → both axes splice, 3800 LF total", () => {
    const r = calcRebarSlabGrid({
      lengthFt: 50, widthFt: 30, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, insetIn: 3, wastePct: 0,
    });
    expect(r.barsLengthwise).toBe(30);
    expect(r.barsWidthwise).toBe(50);
    expect(r.totalLf).toBe(3800);
    expect(r.piecesTotal).toBe(190);
  });

  it("insetIn defaults to 3 when not passed", () => {
    const withDefault = calcRebarSlabGrid({
      lengthFt: 16, widthFt: 10, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, wastePct: 5,
    });
    const withExplicit = calcRebarSlabGrid({
      lengthFt: 16, widthFt: 10, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, insetIn: 3, wastePct: 5,
    });
    expect(withDefault.totalLf).toBe(withExplicit.totalLf);
    expect(withDefault.piecesTotal).toBe(withExplicit.piecesTotal);
  });

  it("inset=0 on 16×10 @ 18\" recovers pre-inset placement", () => {
    const r = calcRebarSlabGrid({
      lengthFt: 16, widthFt: 10, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, insetIn: 0, wastePct: 0,
    });
    expect(r.barsLengthwise).toBe(7);
    expect(r.barsWidthwise).toBe(11);
    expect(r.totalLf).toBe(360);
  });

  it("inset larger than half either side → zero return", () => {
    const r = calcRebarSlabGrid({
      lengthFt: 0.4, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, insetIn: 3, wastePct: 0,
    });
    expect(r.totalLf).toBe(0);
    expect(r.piecesTotal).toBe(0);
  });

  it("returns zero for invalid inputs", () => {
    const r = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 0,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(r.totalLf).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// calcRebarLBar — §8.12 (NEW in v2.3)
// ────────────────────────────────────────────────────────────────────────────
describe("calcRebarLBar — v2.3 L-Bar / hooked rebar", () => {
  it("Spec Example 1: 4 ft dowel, 12\" bend, 18\" spacing, 40 ft run, 3\" inset, 5% waste → 567 LF, 27 pieces", () => {
    const r = calcRebarLBar({
      linearFt: 40,
      spacingIn: 18,
      verticalFt: 4,
      verticalIn: 0,
      bendLengthIn: 12,
      barLengthFt: 20,
      overlapIn: 12,
      insetIn: 3,
      wastePct: 5,
    });
    expect(r.numLBars).toBe(27);
    expect(r.piecesPerLBar).toBe(1);
    expect(r.lfPerLBar).toBe(20);
    expect(r.totalLf).toBe(540);
    expect(r.totalWithWasteLf).toBeCloseTo(567, 5);
    expect(r.piecesTotal).toBe(27);
  });

  it("Spec Example 2: 20 ft wall vertical + 12\" hook, 16\" spacing, 40 ft run, 3\" inset, 5% waste → 1260 LF, 60 pieces", () => {
    const r = calcRebarLBar({
      linearFt: 40,
      spacingIn: 16,
      verticalFt: 20,
      verticalIn: 0,
      bendLengthIn: 12,
      barLengthFt: 20,
      overlapIn: 12,
      insetIn: 3,
      wastePct: 5,
    });
    expect(r.numLBars).toBe(30);
    expect(r.piecesPerLBar).toBe(2);
    expect(r.lfPerLBar).toBe(40);
    expect(r.totalLf).toBe(1200);
    expect(r.totalWithWasteLf).toBeCloseTo(1260, 5);
    expect(r.piecesTotal).toBe(60);
  });

  it("insetIn defaults to 3 when not passed", () => {
    const withDefault = calcRebarLBar({
      linearFt: 40, spacingIn: 18, verticalFt: 4, verticalIn: 0,
      bendLengthIn: 12, barLengthFt: 20, overlapIn: 12, wastePct: 5,
    });
    expect(withDefault.numLBars).toBe(27);
    expect(withDefault.totalLf).toBe(540);
    expect(withDefault.totalWithWasteLf).toBeCloseTo(567, 5);
  });

  it("bendLengthIn=0 degenerates to a straight vertical dowel", () => {
    const r = calcRebarLBar({
      linearFt: 40, spacingIn: 18, verticalFt: 4, verticalIn: 0,
      bendLengthIn: 0, barLengthFt: 20, overlapIn: 12, insetIn: 3, wastePct: 0,
    });
    expect(r.piecesPerLBar).toBe(1);
    expect(r.numLBars).toBe(27);
    expect(r.totalLf).toBe(540);
  });

  it("inset larger than half the run → zero return", () => {
    const r = calcRebarLBar({
      linearFt: 0.4, spacingIn: 18, verticalFt: 4, verticalIn: 0,
      bendLengthIn: 12, barLengthFt: 20, overlapIn: 12, insetIn: 3, wastePct: 0,
    });
    expect(r.numLBars).toBe(0);
    expect(r.totalLf).toBe(0);
    expect(r.piecesTotal).toBe(0);
  });

  it("returns zero for invalid inputs", () => {
    const zeroSpacing = calcRebarLBar({
      linearFt: 40, spacingIn: 0, verticalFt: 4, verticalIn: 0,
      bendLengthIn: 12, barLengthFt: 20, overlapIn: 12, insetIn: 3, wastePct: 0,
    });
    expect(zeroSpacing.totalLf).toBe(0);

    const zeroVertical = calcRebarLBar({
      linearFt: 40, spacingIn: 18, verticalFt: 0, verticalIn: 0,
      bendLengthIn: 0, barLengthFt: 20, overlapIn: 12, insetIn: 3, wastePct: 0,
    });
    expect(zeroVertical.totalLf).toBe(0);
  });
});
