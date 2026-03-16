/**
 * Shared export utilities — used by pdfExport, csvExport, and buildExportData.
 */
import type { ExportCalculatorType } from "@/types/export";

export const LINEAR_TYPES: ExportCalculatorType[] = ["footings", "walls", "grade_beam", "curb"];

export const TYPE_LABELS: Record<ExportCalculatorType, string> = {
  footings: "Footings",
  walls: "Walls",
  grade_beam: "Grade Beam",
  curb: "Curb & Gutter",
  slab: "Slab",
  pier_pad: "Pier Pad",
  cylinder: "Cylinder",
  steps: "Steps/Stairs",
};

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
