import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders one or more card sheet pages (each an element with class
 * `.pdf-page`) into a single multi-page A4 PDF, front side then, if
 * present, a matching `.pdf-page-back` counterpart.
 */
export async function exportSheetsToPdf(
  container: HTMLElement,
  filename: string
) {
  const pages = Array.from(
    container.querySelectorAll<HTMLElement>(".pdf-page")
  );
  if (pages.length === 0) return;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    const y = Math.max(0, (pageHeight - imgHeight) / 2);
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, Math.min(imgHeight, pageHeight));
  }

  pdf.save(filename);
}

/** Exports a single card element (front, and back if provided) to PDF at exact card size. */
export async function exportSingleCardToPdf(
  frontEl: HTMLElement,
  filename: string,
  backEl?: HTMLElement | null
) {
  const CARD_W_IN = 3.375;
  const CARD_H_IN = 2.125;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: [CARD_W_IN, CARD_H_IN],
  });

  const renderInto = async (el: HTMLElement, isFirst: boolean) => {
    const canvas = await html2canvas(el, {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");
    if (!isFirst) pdf.addPage([CARD_W_IN, CARD_H_IN], "landscape");
    pdf.addImage(imgData, "PNG", 0, 0, CARD_W_IN, CARD_H_IN);
  };

  await renderInto(frontEl, true);
  if (backEl) await renderInto(backEl, false);

  pdf.save(filename);
}

/** Triggers the browser print dialog; relies on the #print-root / @media print rules in globals.css. */
export function printNode() {
  window.print();
}
