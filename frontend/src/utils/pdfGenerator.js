import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getContractText, warrantyConditions, checklistSections } from './contractTemplate';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 60;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const MAX_Y = PAGE_HEIGHT - MARGIN_BOTTOM;

function addHeader(doc, folio) {
  doc.setFillColor(27, 54, 93);
  doc.rect(0, 0, PAGE_WIDTH, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Constructora Hacienda del Monte, S.A. de C.V.', MARGIN_LEFT, 13);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio: ${folio}`, PAGE_WIDTH - MARGIN_RIGHT, 13, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc, pageNum, totalPages, folio, fecha, signatureImg) {
  const footerY = PAGE_HEIGHT - 45;

  doc.setDrawColor(27, 54, 93);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, footerY, PAGE_WIDTH - MARGIN_RIGHT, footerY);

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Firmado electrónicamente (demo) | Folio: ${folio} | Fecha: ${fecha}`,
    MARGIN_LEFT,
    footerY + 8
  );
  doc.text(
    `Página ${pageNum} de ${totalPages}`,
    PAGE_WIDTH - MARGIN_RIGHT,
    footerY + 8,
    { align: 'right' }
  );

  doc.setFontSize(6);
  doc.text(
    'Este documento fue generado electrónicamente y no requiere firma autógrafa para su validez (DEMO).',
    MARGIN_LEFT,
    footerY + 14
  );

  if (signatureImg) {
    try {
      const sigW = 40;
      const sigH = 18;
      const sigX = PAGE_WIDTH - MARGIN_RIGHT - sigW;
      const sigY = footerY + 10;
      doc.addImage(signatureImg, 'PNG', sigX, sigY, sigW, sigH);
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('Firma del propietario', sigX + sigW / 2, sigY + sigH + 4, { align: 'center' });
    } catch (e) {
      console.warn('No se pudo agregar firma en footer:', e);
    }
  }

  doc.setTextColor(0, 0, 0);
}

function addNewPage(doc, folio) {
  doc.addPage();
  addHeader(doc, folio);
  return MARGIN_TOP + 5;
}

function writeWrappedText(doc, text, x, y, maxWidth, lineHeight, folio) {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    if (y > MAX_Y) {
      y = addNewPage(doc, folio);
    }
    doc.text(lines[i], x, y);
    y += lineHeight;
  }
  return y;
}

export function generatePDF({ formData, checkedItems, signatureImg }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const folio = formData.folio || 'HM-000-00000000-0000';
  const now = new Date();
  const fechaHora = `${now.toLocaleDateString('es-MX')} ${now.toLocaleTimeString('es-MX')}`;

  // ===================== PAGE 1: Contract =====================
  addHeader(doc, folio);
  let y = MARGIN_TOP + 5;

  const contractSections = getContractText(formData);

  for (const section of contractSections) {
    if (section.title) {
      if (y > MAX_Y - 10) {
        y = addNewPage(doc, folio);
      }

      if (section.title === 'ACTA DE ENTREGA-RECEPCIÓN DE VIVIENDA') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(27, 54, 93);
        doc.text(section.title, PAGE_WIDTH / 2, y, { align: 'center' });
        y += 4;
        doc.setDrawColor(27, 54, 93);
        doc.setLineWidth(0.8);
        doc.line(MARGIN_LEFT + 20, y, PAGE_WIDTH - MARGIN_RIGHT - 20, y);
        y += 10;
        doc.setTextColor(0, 0, 0);
        continue;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 54, 93);
      doc.text(section.title, MARGIN_LEFT, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }

    if (section.content) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const paragraphs = section.content.split('\n');
      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          y += 3;
          continue;
        }
        y = writeWrappedText(doc, paragraph.trim(), MARGIN_LEFT, y, CONTENT_WIDTH, 4.5, folio);
        y += 2;
      }
      y += 4;
    }
  }

  // ===================== PAGE 2: Checklist =====================
  y = addNewPage(doc, folio);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93);
  doc.text('ANEXO A — CHECKLIST DE ENTREGA', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(27, 54, 93);
  doc.setLineWidth(0.8);
  doc.line(MARGIN_LEFT + 20, y, PAGE_WIDTH - MARGIN_RIGHT - 20, y);
  y += 10;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Inspección realizada el ${formData.fechaEntrega || '---'} | Casa No. ${formData.numeroCasa || '---'}`,
    MARGIN_LEFT,
    y
  );
  y += 8;
  doc.setTextColor(0, 0, 0);

  for (const section of checklistSections) {
    if (y > MAX_Y - 15) {
      y = addNewPage(doc, folio);
    }

    doc.setFillColor(240, 244, 248);
    doc.rect(MARGIN_LEFT, y - 4, CONTENT_WIDTH, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(27, 54, 93);
    doc.text(section.title.toUpperCase(), MARGIN_LEFT + 3, y);
    doc.setTextColor(0, 0, 0);
    y += 8;

    for (const item of section.items) {
      if (y > MAX_Y) {
        y = addNewPage(doc, folio);
      }
      const isChecked = checkedItems[item.id] === true;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Draw checkbox
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.rect(MARGIN_LEFT + 3, y - 3, 4, 4);

      if (isChecked) {
        doc.setTextColor(0, 130, 60);
        doc.setFont('helvetica', 'bold');
        doc.text('✓', MARGIN_LEFT + 3.7, y);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      doc.text(item.label, MARGIN_LEFT + 12, y);

      const statusText = isChecked ? 'OK' : 'N/V';
      const statusColor = isChecked ? [0, 130, 60] : [200, 50, 50];
      doc.setTextColor(...statusColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, PAGE_WIDTH - MARGIN_RIGHT - 5, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      y += 6;
    }
    y += 4;
  }

  // Summary counts
  const allItems = checklistSections.flatMap((s) => s.items);
  const checkedCount = allItems.filter((i) => checkedItems[i.id]).length;
  const totalCount = allItems.length;

  if (y > MAX_Y - 20) {
    y = addNewPage(doc, folio);
  }

  y += 4;
  doc.setDrawColor(27, 54, 93);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Resumen: ${checkedCount} de ${totalCount} puntos verificados`, MARGIN_LEFT, y);
  y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'El propietario confirma haber revisado la vivienda y que los puntos marcados reflejan el estado al momento de la entrega.',
    MARGIN_LEFT,
    y
  );

  // ===================== PAGE 3: Warranty =====================
  y = addNewPage(doc, folio);

  for (const section of warrantyConditions) {
    if (section.title && section.content === '') {
      // Main title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 54, 93);
      doc.text(section.title, PAGE_WIDTH / 2, y, { align: 'center' });
      y += 4;
      doc.setDrawColor(27, 54, 93);
      doc.setLineWidth(0.8);
      doc.line(MARGIN_LEFT + 10, y, PAGE_WIDTH - MARGIN_RIGHT - 10, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
      continue;
    }

    if (y > MAX_Y - 10) {
      y = addNewPage(doc, folio);
    }

    if (section.title) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(27, 54, 93);
      doc.text(section.title, MARGIN_LEFT, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }

    if (section.content) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const paragraphs = section.content.split('\n');
      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          y += 3;
          continue;
        }
        y = writeWrappedText(doc, paragraph.trim(), MARGIN_LEFT, y, CONTENT_WIDTH, 4.5, folio);
        y += 2;
      }
      y += 4;
    }
  }

  // ===================== Signature block on last page =====================
  if (y > MAX_Y - 40) {
    y = addNewPage(doc, folio);
  }

  y += 10;
  doc.setDrawColor(27, 54, 93);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 54, 93);
  doc.text('FIRMAS DE CONFORMIDAD', PAGE_WIDTH / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 12;

  // Signature for owner
  const sigBlockX1 = MARGIN_LEFT;
  const sigBlockX2 = PAGE_WIDTH / 2 + 10;

  if (signatureImg) {
    try {
      doc.addImage(signatureImg, 'PNG', sigBlockX1 + 5, y, 50, 22);
    } catch (e) {
      console.warn('Error adding signature:', e);
    }
  }

  y += 25;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0, 0, 0);
  doc.line(sigBlockX1, y, sigBlockX1 + 65, y);
  doc.line(sigBlockX2, y, sigBlockX2 + 65, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const nombreCompleto = `${formData.nombre || ''} ${formData.apellidoPaterno || ''} ${formData.apellidoMaterno || ''}`.trim();
  doc.text(nombreCompleto || 'EL PROPIETARIO', sigBlockX1, y);
  doc.text('Representante de LA CONSTRUCTORA', sigBlockX2, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('EL PROPIETARIO', sigBlockX1, y);
  doc.text('Constructora Hacienda del Monte', sigBlockX2, y);

  // ===================== Add footers to all pages =====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages, folio, fechaHora, signatureImg);
  }

  // Generate filename
  const apellido = (formData.apellidoPaterno || 'Sin_Apellido').replace(/\s+/g, '_');
  const casa = formData.numeroCasa || '0';
  const fileName = `Acta_Entrega_Recepcion_Casa_${casa}_${apellido}.pdf`;

  doc.save(fileName);
  return fileName;
}
