/**
 * Calculation Engine — Barrel export
 * Re-exports from the shared calculation module (single source of truth).
 */
export {
  // Utilities
  toTotalInches,
  inchesToFeet,
  cubicFtToCy,
  applyWaste,
  calcSpliceOverlap,

  // Volume calculators
  calcFooting,
  calcWall,
  calcGradeBeam,
  calcCurbGutter,
  calcSlabSection,
  calcSlabArea,
  calcPierPad,
  calcCylinder,
  calcSteps,

  // Rebar calculators
  calcRebarHorizontal,
  calcRebarVertical,
  calcRebarSlabGrid,

  // Stone
  calcStoneBase,
} from "../../../shared/calculations/index";

export type {
  ImperialLength,
  FootingInput, FootingResult, WallAddonInput,
  WallInput, WallResult,
  GradeBeamInput, GradeBeamResult,
  CurbGutterInput, CurbGutterResult,
  SlabSectionInput, SlabSectionResult, SlabAreaInput, SlabAreaResult,
  PierPadInput, PierPadResult,
  CylinderInput, CylinderResult,
  StepsInput, StepsResult,
  RebarHorizontalInput, RebarHorizontalResult,
  RebarVerticalInput, RebarVerticalResult,
  RebarSlabGridInput, RebarSlabGridResult,
  StoneBaseInput, StoneBaseResult,
} from "../../../shared/calculations/index";
