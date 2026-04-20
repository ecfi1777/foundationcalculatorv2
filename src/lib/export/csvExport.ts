/**
 * CSV export — internal module called only by exportService.
 */
import type { ProjectExportData } from "@/types/export";
import { TYPE_LABELS, sanitizeFilename } from "./exportUtils";

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function generateCSV(data: ProjectExportData): Promise<void> {
  const headers = ["Area Name", "Type", "Linear Ft", "Sqft", "Concrete (yd³)", "Rebar (LF)", "Stone (tons)"];
  const rows: string[][] = [headers];

  for (const area of data.areas) {
    const rebarTotal = area.rebarEnabled
      ? (area.rebarHorizLF ?? 0) + (area.rebarVertLF ?? 0) + (area.rebarLBarLF ?? 0) + (area.rebarGridLF ?? 0)
      : null;

    rows.push([
      escapeCSV(area.name),
      TYPE_LABELS[area.calculatorType],
      area.totalLinearFt != null ? String(area.totalLinearFt) : "",
      area.totalSqft != null ? String(area.totalSqft) : "",
      String(area.totalVolumeCY),
      rebarTotal != null ? String(rebarTotal) : "",
      area.stoneEnabled && area.stoneTons != null ? String(area.stoneTons) : "",
    ]);
  }

  // Totals row
  rows.push([
    "PROJECT TOTALS",
    "",
    data.projectTotals.linearFt != null ? String(data.projectTotals.linearFt) : "",
    data.projectTotals.sqft != null ? String(data.projectTotals.sqft) : "",
    String(data.projectTotals.concreteCY),
    data.projectTotals.rebarLF != null ? String(data.projectTotals.rebarLF) : "",
    data.projectTotals.stoneTons != null ? String(data.projectTotals.stoneTons) : "",
  ]);

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const safeName = sanitizeFilename(data.projectName);
  const filename = `${safeName}-foundation-estimate-${data.exportDate}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
