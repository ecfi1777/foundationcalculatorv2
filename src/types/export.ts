/**
 * Export system types — used by exportService and buildExportData.
 */

export type ExportCalculatorType =
  | "footings"
  | "walls"
  | "grade_beam"
  | "curb"
  | "slab"
  | "pier_pad"
  | "cylinder"
  | "steps";

export interface ProjectExportData {
  projectName: string;
  projectNotes: string | null;
  exportDate: string;

  areas: AreaExportData[];

  projectTotals: {
    concreteCY: number;
    stoneTons: number | null;
    rebarLF: number | null;
    linearFt: number | null;
    sqft: number | null;
  };
}

export interface AreaExportData {
  name: string;
  calculatorType: ExportCalculatorType;

  totalLinearFt: number | null;
  totalSqft: number | null;

  footingVolumeCY: number | null;
  wallVolumeCY: number | null;
  totalVolumeCY: number;

  rebarEnabled: boolean;

  rebarHorizLF: number | null;
  rebarHorizBarSize: string | null;

  rebarVertLF: number | null;
  rebarVertBarSize: string | null;

  rebarLBarLF: number | null;
  rebarLBarBarSize: string | null;
  rebarLBarSpacingIn: number | null;

  rebarGridLF: number | null;
  rebarGridBarSize: string | null;
  rebarGridSpacingIn: number | null;

  stoneEnabled: boolean;
  stoneTons: number | null;

  segments: SegmentExportData[];
  sections: SectionExportData[];
}

export interface SegmentExportData {
  sortOrder: number;
  displayValue: string;
  lengthInchesDecimal: number;
}

export interface SectionExportData {
  name: string;

  lengthFt: number;
  lengthIn: number;

  widthFt: number;
  widthIn: number;

  thicknessIn: number;

  sqft: number;
  volumeCY: number;

  stoneEnabled: boolean;
  stoneTons: number | null;
  stoneDepthIn: number | null;
  stoneTypeName: string | null;
}
