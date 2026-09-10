// Waynautic Academy - PDF Notes Generator
// Generates clean, branded, downloadable PDF notes from Markdown/HTML topic content using jsPDF.

import { jsPDF } from 'jspdf';

interface TopicPdfData {
  title: string;
  slug?: string;
  textContent: string;
  estimatedMinutes?: number;
  moduleTitle?: string;
}

export function generateAndDownloadTopicPdf(topic: TopicPdfData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const marginTop = 20;
  const marginBottom = 18;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  // Helper to add a page and reset Y
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('WAYNAUTIC ACADEMY • AI TRAINING CURRICULUM NOTES', marginX, 10);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, 12, pageWidth - marginX, 12);
  };

  // 1. Initial Page Header Banner
  drawHeaderWatermark();

  // Branding Title Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(marginX, currentY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(56, 189, 248); // Sky 400
  doc.text('WAYNAUTIC ACADEMY', marginX + 6, currentY + 7);

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  const truncatedTitle = topic.title.length > 52 ? `${topic.title.slice(0, 50)}...` : topic.title;
  doc.text(truncatedTitle, marginX + 6, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const metaText = `${topic.moduleTitle ? `${topic.moduleTitle}  •  ` : ''}${topic.estimatedMinutes || 15} mins read  •  Exported on ${new Date().toLocaleDateString()}`;
  doc.text(metaText, marginX + 6, currentY + 20);

  currentY += 30;

  // 2. Parse and Render Markdown Content
  const rawContent = topic.textContent || '';
  
  // Clean basic HTML wrappers if present
  const cleanedContent = rawContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const lines = cleanedContent.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Handle Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        if (codeBuffer.length > 0) {
          const codeBlockText = codeBuffer.join('\n');
          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          const wrappedCode = doc.splitTextToSize(codeBlockText, contentWidth - 8);
          const blockHeight = wrappedCode.length * 3.8 + 8;

          ensureSpace(blockHeight);

          // Draw code box
          doc.setFillColor(15, 23, 42); // slate 900
          doc.roundedRect(marginX, currentY, contentWidth, blockHeight, 2, 2, 'F');

          doc.setTextColor(56, 189, 248); // sky 400
          let codeY = currentY + 5;
          for (const cLine of wrappedCode) {
            doc.text(cLine, marginX + 4, codeY);
            codeY += 3.8;
          }

          currentY += blockHeight + 4;
          codeBuffer = [];
        }
      } else {
        inCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Skip empty lines
    if (!trimmed) {
      currentY += 2.5;
      continue;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      const hText = trimmed.replace(/^#\s+/, '').replace(/[*_]/g, '');
      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42); // slate 900
      doc.text(hText, marginX, currentY);
      doc.setDrawColor(56, 189, 248);
      doc.setLineWidth(0.4);
      doc.line(marginX, currentY + 2, marginX + 35, currentY + 2);
      currentY += 8;
      continue;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      const hText = trimmed.replace(/^##\s+/, '').replace(/[*_]/g, '');
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(2, 132, 199); // Sky 600
      doc.text(hText, marginX, currentY);
      currentY += 6;
      continue;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      const hText = trimmed.replace(/^###\s+/, '').replace(/[*_]/g, '');
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // slate 700
      doc.text(hText, marginX, currentY);
      currentY += 5;
      continue;
    }

    // Callouts / Alerts (> [!NOTE], etc.)
    if (trimmed.startsWith('>')) {
      const calloutText = trimmed.replace(/^>\s*/, '').replace(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/g, '$1:').replace(/[*_]/g, '');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const wrappedCallout = doc.splitTextToSize(calloutText, contentWidth - 8);
      const boxHeight = wrappedCallout.length * 4 + 6;

      ensureSpace(boxHeight);

      doc.setFillColor(240, 249, 255); // sky 50
      doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 1.5, 1.5, 'F');
      doc.setDrawColor(2, 132, 199);
      doc.setLineWidth(0.8);
      doc.line(marginX, currentY, marginX, currentY + boxHeight);

      doc.setTextColor(3, 105, 161);
      let calloutY = currentY + 4.5;
      for (const cLine of wrappedCallout) {
        doc.text(cLine, marginX + 4, calloutY);
        calloutY += 4;
      }

      currentY += boxHeight + 4;
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const cleanBullet = trimmed.replace(/^([-*]|\d+\.)\s+/, '').replace(/[*_`]/g, '');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      const wrappedBullet = doc.splitTextToSize(cleanBullet, contentWidth - 6);
      ensureSpace(wrappedBullet.length * 4.2 + 2);

      doc.setFillColor(2, 132, 199);
      doc.circle(marginX + 2, currentY - 1, 0.8, 'F');

      let bulletY = currentY;
      for (let b = 0; b < wrappedBullet.length; b++) {
        doc.text(wrappedBullet[b], marginX + 6, bulletY);
        bulletY += 4.2;
      }
      currentY = bulletY + 1.5;
      continue;
    }

    // Regular text paragraph
    const cleanParagraph = trimmed.replace(/[*_`]/g, '');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    const wrappedParagraph = doc.splitTextToSize(cleanParagraph, contentWidth);
    ensureSpace(wrappedParagraph.length * 4.2 + 2);

    for (const pLine of wrappedParagraph) {
      doc.text(pLine, marginX, currentY);
      currentY += 4.2;
    }
    currentY += 2;
  }

  // 3. Number all pages in footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    // Left footer text
    doc.text('Waynautic Academy • AI Engineering Portal', marginX, pageHeight - 8);

    // Right footer page count
    const pageStr = `Page ${p} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - marginX - pageStrWidth, pageHeight - 8);
  }

  // 4. Download file
  const safeFilename = (topic.slug || topic.title || 'lesson-notes')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`Waynautic-Notes-${safeFilename}.pdf`);
}
