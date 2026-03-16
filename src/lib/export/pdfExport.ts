/**
 * PDF export — internal module called only by exportService.
 * Uses html2pdf.js for client-side generation.
 */
import type { ProjectExportData, AreaExportData } from "@/types/export";
import { LINEAR_TYPES, TYPE_LABELS, sanitizeFilename } from "./exportUtils";

function fmtConcrete(v: number): string {
  return v.toFixed(2);
}

function fmtLinearFt(v: number): string {
  return v.toFixed(2);
}

function fmtSqft(v: number): string {
  return Math.round(v).toLocaleString();
}

function fmtStone(v: number): string {
  return v.toFixed(2);
}

function fmtRebar(v: number): string {
  return Math.round(v).toLocaleString();
}

function buildAreaHTML(area: AreaExportData): string {
  const isLinear = LINEAR_TYPES.includes(area.calculatorType);
  let html = `<div style="margin-bottom:18px;page-break-inside:avoid;">`;
  html += `<h3 style="margin:0 0 6px;font-size:14px;font-weight:600;">${area.name} <span style="color:#888;font-weight:400;font-size:12px;">(${TYPE_LABELS[area.calculatorType]})</span></h3>`;

  // Segments for linear types
  if (isLinear && area.segments.length > 0) {
    html += `<div style="margin-left:12px;margin-bottom:6px;">`;
    html += `<div style="font-size:11px;color:#666;margin-bottom:2px;">Segments:</div>`;
    for (const seg of area.segments) {
      html += `<div style="font-size:12px;font-family:monospace;margin-left:8px;">Segment ${seg.sortOrder}: ${seg.displayValue}</div>`;
    }
    html += `</div>`;
    if (area.totalLinearFt != null) {
      html += `<div style="font-size:12px;margin-bottom:4px;">Total Linear Feet: <strong style="font-family:monospace;">${fmtLinearFt(area.totalLinearFt)} LF</strong></div>`;
    }
  }

  // Footing + Wall volumes
  if (area.footingVolumeCY != null && area.footingVolumeCY > 0) {
    html += `<div style="font-size:12px;">Footing Volume: <strong style="font-family:monospace;">${fmtConcrete(area.footingVolumeCY)} yd³</strong></div>`;
  }
  if (area.wallVolumeCY != null && area.wallVolumeCY > 0) {
    html += `<div style="font-size:12px;">Wall Volume: <strong style="font-family:monospace;">${fmtConcrete(area.wallVolumeCY)} yd³</strong></div>`;
  }

  // Sections for slab / pier pad
  if (area.sections.length > 0) {
    html += `<div style="margin-left:12px;margin-bottom:6px;">`;
    html += `<div style="font-size:11px;color:#666;margin-bottom:2px;">Sections:</div>`;
    for (const sec of area.sections) {
      html += `<div style="font-size:12px;margin-left:8px;margin-bottom:4px;">`;
      html += `<div style="font-weight:500;">${sec.name}</div>`;
      html += `<div style="font-family:monospace;font-size:11px;">L ${sec.lengthFt}' ${sec.lengthIn}" × W ${sec.widthFt}' ${sec.widthIn}" × T ${sec.thicknessIn}"</div>`;
      html += `<div style="font-size:11px;">Sqft: ${fmtSqft(sec.sqft)} SF | Volume: ${fmtConcrete(sec.volumeCY)} yd³</div>`;
      if (sec.stoneEnabled && sec.stoneTons != null) {
        html += `<div style="font-size:11px;">Stone: ${fmtStone(sec.stoneTons)} tons (${sec.stoneDepthIn}" ${sec.stoneTypeName ?? "#57"})</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
    if (area.totalSqft != null) {
      html += `<div style="font-size:12px;margin-bottom:4px;">Total Square Feet: <strong style="font-family:monospace;">${fmtSqft(area.totalSqft)} SF</strong></div>`;
    }
  }

  // Area total separator
  html += `<div style="border-top:1px solid #ccc;margin:8px 0 4px;"></div>`;
  html += `<div style="font-size:13px;font-weight:600;">Area Total: <span style="font-family:monospace;">${fmtConcrete(area.totalVolumeCY)} yd³</span></div>`;

  // Rebar lines
  if (area.rebarHorizLF != null && area.rebarHorizLF > 0) {
    html += `<div style="font-size:12px;">Rebar (Horiz ${area.rebarHorizBarSize}): <span style="font-family:monospace;">${fmtRebar(area.rebarHorizLF)} LF</span></div>`;
  }
  if (area.rebarVertLF != null && area.rebarVertLF > 0) {
    html += `<div style="font-size:12px;">Rebar (Vert ${area.rebarVertBarSize}): <span style="font-family:monospace;">${fmtRebar(area.rebarVertLF)} LF</span></div>`;
  }
  if (area.rebarGridLF != null && area.rebarGridLF > 0) {
    html += `<div style="font-size:12px;">Rebar Grid (${area.rebarGridBarSize} @ ${area.rebarGridSpacingIn}"): <span style="font-family:monospace;">${fmtRebar(area.rebarGridLF)} LF</span></div>`;
  }

  // Stone
  if (area.stoneEnabled && area.stoneTons != null) {
    html += `<div style="font-size:12px;">Stone Base: <span style="font-family:monospace;">${fmtStone(area.stoneTons)} tons</span></div>`;
  }

  html += `</div>`;
  return html;
}

function buildHTML(data: ProjectExportData): string {
  let html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;max-width:700px;margin:0 auto;padding:20px;">`;

  // Header
  html += `<div style="margin-bottom:20px;">`;
  html += `<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Total Foundation Calculator</div>`;
  html += `<h1 style="margin:0 0 4px;font-size:22px;font-weight:700;">${data.projectName}</h1>`;
  html += `<div style="font-size:12px;color:#666;">Export Date: ${data.exportDate}</div>`;
  if (data.projectNotes) {
    html += `<div style="margin-top:8px;font-size:12px;color:#444;border-left:3px solid #ddd;padding-left:10px;">${data.projectNotes}</div>`;
  }
  html += `</div>`;

  // Areas
  for (const area of data.areas) {
    html += buildAreaHTML(area);
  }

  // Project totals
  html += `<div style="border-top:3px double #333;margin-top:16px;padding-top:12px;">`;
  html += `<div style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Project Totals</div>`;
  html += `<div style="font-size:13px;">Concrete: <strong style="font-family:monospace;">${fmtConcrete(data.projectTotals.concreteCY)} yd³</strong></div>`;
  if (data.projectTotals.stoneTons != null) {
    html += `<div style="font-size:13px;">Stone: <strong style="font-family:monospace;">${fmtStone(data.projectTotals.stoneTons)} tons</strong></div>`;
  }
  if (data.projectTotals.rebarLF != null) {
    html += `<div style="font-size:13px;">Rebar: <strong style="font-family:monospace;">${fmtRebar(data.projectTotals.rebarLF)} LF</strong></div>`;
  }
  html += `<div style="border-top:3px double #333;margin-top:8px;"></div>`;
  html += `</div>`;

  html += `</div>`;
  return html;
}

export async function generatePDF(data: ProjectExportData): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js");

  const container = document.createElement("div");
  container.innerHTML = buildHTML(data);
  document.body.appendChild(container);

  const safeName = sanitizeFilename(data.projectName);
  const filename = `${safeName}-foundation-estimate-${data.exportDate}.pdf`;

  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
    })
    .from(container)
    .save();

  document.body.removeChild(container);
}
