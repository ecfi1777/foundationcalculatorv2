/**
 * Export service — public API.
 * UI components must import ONLY this file for export functionality.
 */
import type { ProjectExportData } from "@/types/export";

export async function exportProjectToPDF(data: ProjectExportData): Promise<void> {
  const { generatePDF } = await import("./pdfExport");
  return generatePDF(data);
}

export async function exportProjectToCSV(data: ProjectExportData): Promise<void> {
  const { generateCSV } = await import("./csvExport");
  return generateCSV(data);
}
