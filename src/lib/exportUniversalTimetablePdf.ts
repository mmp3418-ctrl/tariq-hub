import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Capture the rendered RTL timetable element and download a landscape A4 PDF.
 */
export async function exportUniversalTimetablePdf(
  element: HTMLElement,
  fileName = "جدول-الحصص.pdf",
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#0b1220",
    useCORS: true,
    logging: false,
  } as Parameters<typeof html2canvas>[1]);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imgHeight = (canvas.height * usableWidth) / canvas.width;
  const finalHeight = Math.min(imgHeight, usableHeight);
  const finalWidth = (canvas.width * finalHeight) / canvas.height;
  const x = (pageWidth - finalWidth) / 2;
  const y = margin;

  pdf.setFillColor(11, 18, 32);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save(fileName);
}
