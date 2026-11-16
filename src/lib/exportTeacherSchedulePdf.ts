import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { scheduleSlots } from "../services/teacherContent.ts";

export type SchedulePdfOptions = {
  planner: Record<string, string>;
  days: readonly string[];
  locale: "ar" | "en";
  brandName: string;
  brandMarkEn: string;
  scheduleTitle: string;
  periodLabel: string;
  emptyCell: string;
  fileName: string;
};

const NAVY = "#0B1F33";
const EMERALD = "#10B981";
const SOFT = "#64748B";
const LINE = "#E2E8F0";
const SURFACE = "#F8FAFC";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildSheet(options: SchedulePdfOptions) {
  const { planner, days, locale, brandName, brandMarkEn, scheduleTitle, periodLabel, emptyCell } = options;
  const rtl = locale === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-LY" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const headCells = days
    .map(
      (day) =>
        `<th style="background:${NAVY};color:#fff;padding:12px 10px;border:1px solid ${NAVY};font-size:13px;font-weight:700;text-align:center;white-space:nowrap;">${escapeHtml(day)}</th>`,
    )
    .join("");

  const bodyRows = scheduleSlots
    .map((slot) => {
      const cells = days
        .map((_, dayIndex) => {
          const key = `${dayIndex}-${slot}`;
          const value = (planner[key] ?? "").trim() || emptyCell;
          const muted = !(planner[key] ?? "").trim();
          return `<td style="border:1px solid ${LINE};padding:11px 10px;text-align:center;font-size:12px;color:${muted ? SOFT : "#0F172A"};background:#fff;min-width:108px;">${escapeHtml(value)}</td>`;
        })
        .join("");
      return `<tr>
        <td style="border:1px solid ${LINE};padding:11px 10px;text-align:center;font-size:12px;font-weight:700;color:${EMERALD};background:${SURFACE};width:72px;">${escapeHtml(slot)}</td>
        ${cells}
      </tr>`;
    })
    .join("");

  const root = document.createElement("div");
  root.setAttribute("dir", dir);
  root.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:1120px",
    "padding:36px 40px 40px",
    "background:#ffffff",
    "color:#0F172A",
    'font-family:"Cairo","Segoe UI",Tahoma,sans-serif',
    "box-sizing:border-box",
  ].join(";");

  root.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:18px;">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:10px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${EMERALD};"></span>
          <span style="font-size:11px;letter-spacing:0.18em;font-weight:700;color:${EMERALD};text-transform:uppercase;">${escapeHtml(brandMarkEn)}</span>
        </div>
        <div style="font-size:28px;font-weight:800;color:${NAVY};line-height:1.2;">${escapeHtml(brandName)}</div>
        <div style="margin-top:6px;font-size:16px;font-weight:700;color:#334155;">${escapeHtml(scheduleTitle)}</div>
      </div>
      <div style="text-align:${rtl ? "left" : "right"};font-size:12px;color:${SOFT};line-height:1.7;">
        <div>${escapeHtml(dateLabel)}</div>
        <div style="color:${EMERALD};font-weight:700;">${rtl ? "بوابة المعلمين" : "Teacher Portal"}</div>
      </div>
    </div>
    <div style="height:3px;width:100%;background:linear-gradient(90deg, ${EMERALD}, ${NAVY});border-radius:999px;margin-bottom:18px;"></div>
    <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
      <thead>
        <tr>
          <th style="background:${NAVY};color:#fff;padding:12px 10px;border:1px solid ${NAVY};font-size:13px;font-weight:700;text-align:center;width:72px;">${escapeHtml(periodLabel)}</th>
          ${headCells}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <div style="margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:${SOFT};">
      <span>${rtl ? "منصة طارق · مساحة المعلم" : "Tariq Platform · Teacher's Space"}</span>
      <span style="color:${EMERALD};font-weight:700;">#10B981</span>
    </div>
  `;

  return root;
}

export async function exportTeacherSchedulePdf(options: SchedulePdfOptions) {
  const sheet = buildSheet(options);
  document.body.appendChild(sheet);

  try {
    await document.fonts?.ready;
    const canvas = await html2canvas(sheet, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: sheet.scrollWidth,
      windowHeight: sheet.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const renderWidth = canvas.width * ratio;
    const renderHeight = canvas.height * ratio;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight, undefined, "FAST");
    pdf.save(options.fileName);
  } finally {
    sheet.remove();
  }
}
