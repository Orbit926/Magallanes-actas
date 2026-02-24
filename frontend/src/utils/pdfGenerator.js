import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getContractText, warrantyConditions, checklistSections } from './contractTemplate';
import { themeColors, hexToRgb } from '../config/theme';

// Colores del theme convertidos a RGB
const primaryRgb = hexToRgb(themeColors.primary.main);
const primaryDarkRgb = hexToRgb(themeColors.primary.dark);
const secondaryRgb = hexToRgb(themeColors.secondary.main);

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 25;
const MARGIN_RIGHT = 25;
const MARGIN_TOP = 30;
const MARGIN_BOTTOM = 60;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const MAX_Y = PAGE_HEIGHT - MARGIN_BOTTOM;

// Variables para almacenar imágenes en base64
let logoBase64 = null;
let firmaRepresentanteBase64 = null;

// Función para cargar una imagen como base64
async function loadImage(path) {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`No se pudo cargar la imagen ${path}:`, e);
    return null;
  }
}

async function loadLogo() {
  if (logoBase64) return logoBase64;
  logoBase64 = await loadImage('/logos/logo.png');
  return logoBase64;
}

async function loadFirmaRepresentante() {
  if (firmaRepresentanteBase64) return firmaRepresentanteBase64;
  firmaRepresentanteBase64 = await loadImage('/firma/firma-ejemplo.png');
  return firmaRepresentanteBase64;
}

function addHeader(doc, folio, logoImg) {
  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE_WIDTH, 22, 'F');
  
  // Línea dorada en el borde inferior del header
  doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.setLineWidth(2);
  doc.line(0, 22, PAGE_WIDTH, 22);
  
  // Logo
  if (logoImg) {
    try {
      doc.addImage(logoImg, 'PNG', MARGIN_LEFT, 3, 16, 16);
    } catch (e) {
      console.warn('No se pudo agregar logo en header:', e);
    }
  }
  
  // Texto del header - Magallanes Residencial en dorado
  const textX = logoImg ? MARGIN_LEFT + 20 : MARGIN_LEFT;
  doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Magallanes Residencial', textX, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`Folio: ${folio}`, PAGE_WIDTH - MARGIN_RIGHT, 12, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc, pageNum, totalPages, folio, fecha, signatureImg, firmaVendedor) {
  const footerY = PAGE_HEIGHT - 45;

  doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, footerY, PAGE_WIDTH - MARGIN_RIGHT, footerY);

  // Firma del vendedor en el lado izquierdo
  if (firmaVendedor) {
    try {
      const sigW = 35;
      const sigH = 16;
      const sigX = MARGIN_LEFT;
      const sigY = footerY + 4;
      doc.addImage(firmaVendedor, 'PNG', sigX, sigY, sigW, sigH);
      doc.setFontSize(5);
      doc.setTextColor(100, 100, 100);
      doc.text('Vendedor', sigX + sigW / 2, sigY + sigH + 3, { align: 'center' });
    } catch (e) {
      console.warn('No se pudo agregar firma vendedor en footer:', e);
    }
  }

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  const textStartX = firmaVendedor ? MARGIN_LEFT + 42 : MARGIN_LEFT;
  doc.text(
    `Folio: ${folio} | Fecha: ${fecha}`,
    textStartX,
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
    'Este documento fue generado electrónicamente.',
    textStartX,
    footerY + 14
  );

  if (signatureImg) {
    try {
      const sigW = 35;
      const sigH = 16;
      const sigX = PAGE_WIDTH - MARGIN_RIGHT - sigW;
      const sigY = footerY + 4;
      doc.addImage(signatureImg, 'PNG', sigX, sigY, sigW, sigH);
      doc.setFontSize(5);
      doc.setTextColor(100, 100, 100);
      doc.text('Propietario', sigX + sigW / 2, sigY + sigH + 3, { align: 'center' });
    } catch (e) {
      console.warn('No se pudo agregar firma en footer:', e);
    }
  }

  doc.setTextColor(0, 0, 0);
}

function addNewPage(doc, folio, logoImg) {
  doc.addPage();
  addHeader(doc, folio, logoImg);
  return MARGIN_TOP + 5;
}

function writeWrappedText(doc, text, x, y, maxWidth, lineHeight, folio, logoImg) {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    if (y > MAX_Y) {
      y = addNewPage(doc, folio, logoImg);
    }
    doc.text(lines[i], x, y);
    y += lineHeight;
  }
  return y;
}

export async function generatePDF({ formData, checkedItems, comments, signatureImg }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const folio = formData.folio || 'HM-000-00000000-0000';
  const now = new Date();
  const fechaHora = `${now.toLocaleDateString('es-MX')} ${now.toLocaleTimeString('es-MX')}`;
  
  // Cargar logo y firma del representante
  const logoImg = await loadLogo();
  const firmaRepresentante = await loadFirmaRepresentante();

  // ===================== PAGE 1: Contract =====================
  addHeader(doc, folio, logoImg);
  let y = MARGIN_TOP + 5;

  const contractSections = getContractText(formData);

  for (const section of contractSections) {
    if (section.title) {
      if (y > MAX_Y - 10) {
        y = addNewPage(doc, folio, logoImg);
      }

      if (section.title === 'ACTA DE ENTREGA-RECEPCIÓN DE VIVIENDA') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
        doc.text(section.title, PAGE_WIDTH / 2, y, { align: 'center' });
        y += 4;
        doc.setDrawColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
        doc.setLineWidth(0.8);
        doc.line(MARGIN_LEFT + 20, y, PAGE_WIDTH - MARGIN_RIGHT - 20, y);
        y += 10;
        doc.setTextColor(0, 0, 0);
        continue;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
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
        y = writeWrappedText(doc, paragraph.trim(), MARGIN_LEFT, y, CONTENT_WIDTH, 4.5, folio, logoImg);
        y += 2;
      }
      y += 4;
    }
  }

  // ===================== PAGE 2: Checklist =====================
  y = addNewPage(doc, folio, logoImg);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
  doc.text('ANEXO A — CHECKLIST DE ENTREGA', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
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
      y = addNewPage(doc, folio, logoImg);
    }

    doc.setFillColor(240, 244, 248);
    doc.rect(MARGIN_LEFT, y - 4, CONTENT_WIDTH, 7, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
    doc.text(section.title.toUpperCase(), MARGIN_LEFT + 3, y);
    doc.setTextColor(0, 0, 0);
    y += 8;

    for (const item of section.items) {
      if (y > MAX_Y) {
        y = addNewPage(doc, folio, logoImg);
      }
      const isChecked = checkedItems[item.id] === true;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Draw checkbox - improved rendering
      const checkboxX = MARGIN_LEFT + 3;
      const checkboxY = y - 3.5;
      const checkboxSize = 4;
      
      // Draw checkbox border
      doc.setDrawColor(120, 120, 120);
      doc.setLineWidth(0.4);
      doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize);

      if (isChecked) {
        // Draw checkmark as lines for cleaner look
        doc.setDrawColor(0, 130, 60);
        doc.setLineWidth(0.6);
        // First line of checkmark (short)
        doc.line(checkboxX + 0.8, checkboxY + 2.2, checkboxX + 1.6, checkboxY + 3);
        // Second line of checkmark (long)
        doc.line(checkboxX + 1.6, checkboxY + 3, checkboxX + 3.2, checkboxY + 1);
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
    y = addNewPage(doc, folio, logoImg);
  }

  y += 4;
  doc.setDrawColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
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

  // ===================== COMMENTS SECTION =====================
  if (comments && comments.trim()) {
    y += 12;
    
    if (y > MAX_Y - 30) {
      y = addNewPage(doc, folio, logoImg);
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
    doc.text('COMENTARIOS Y OBSERVACIONES', MARGIN_LEFT, y);
    y += 2;
    doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_LEFT, y, MARGIN_LEFT + 70, y);
    y += 6;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const commentLines = comments.split('\n');
    for (const line of commentLines) {
      if (line.trim()) {
        y = writeWrappedText(doc, line.trim(), MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT, 4.5, folio, logoImg);
        y += 1;
      }
    }
  }

  // ===================== PAGE 3: Warranty =====================
  y = addNewPage(doc, folio, logoImg);

  for (const section of warrantyConditions) {
    if (section.title && section.content === '') {
      // Main title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
      doc.text(section.title, PAGE_WIDTH / 2, y, { align: 'center' });
      y += 4;
      doc.setDrawColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
      doc.setLineWidth(0.8);
      doc.line(MARGIN_LEFT + 10, y, PAGE_WIDTH - MARGIN_RIGHT - 10, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
      continue;
    }

    if (y > MAX_Y - 10) {
      y = addNewPage(doc, folio, logoImg);
    }

    if (section.title) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
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
        y = writeWrappedText(doc, paragraph.trim(), MARGIN_LEFT, y, CONTENT_WIDTH, 4.5, folio, logoImg);
        y += 2;
      }
      y += 4;
    }
  }

  // ===================== Signature block on last page =====================
  if (y > MAX_Y - 70) {
    y = addNewPage(doc, folio, logoImg);
  }

  y += 10;
  doc.setDrawColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 8;

  // Texto de conformidad (movido de la segunda hoja)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const textoConformidad = 'Firmando de conformidad para constancia de la entrega del Inmueble, conocimiento del reglamento, de la presente Póliza de Garantía y para los efectos legales correspondientes.';
  y = writeWrappedText(doc, textoConformidad, MARGIN_LEFT, y, CONTENT_WIDTH, 4.5, folio, logoImg);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDarkRgb.r, primaryDarkRgb.g, primaryDarkRgb.b);
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
      console.warn('Error adding owner signature:', e);
    }
  }

  // Firma del representante de la constructora
  if (firmaRepresentante) {
    try {
      doc.addImage(firmaRepresentante, 'PNG', sigBlockX2 + 5, y, 50, 22);
    } catch (e) {
      console.warn('Error adding representative signature:', e);
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
  doc.text('Arq. Mayra Belén Lupercio Romero', sigBlockX2, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('EL PROPIETARIO', sigBlockX1, y);
  doc.text('En rep. del Lic. Ricardo García Rulfo de Aguinaga', sigBlockX2, y);

  // ===================== Add footers to all pages =====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // En la última página no poner firmas en el pie (ya están las firmas finales arriba)
    const isLastPage = i === totalPages;
    addFooter(doc, i, totalPages, folio, fechaHora, isLastPage ? null : signatureImg, isLastPage ? null : firmaRepresentante);
  }

  // Generate filename
  const apellido = (formData.apellidoPaterno || 'Sin_Apellido').replace(/\s+/g, '_');
  const casa = formData.numeroCasa || '0';
  const fileName = `Acta_Entrega_Recepcion_Casa_${casa}_${apellido}.pdf`;

  doc.save(fileName);
  return fileName;
}
