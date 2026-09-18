// Waynautic Academy - PDF Notes Generator
// Generates clean, branded, downloadable PDF notes from Markdown/HTML topic content using jsPDF.
// Features: Logo header, callout boxes with color-coded left borders, styled headings, and code blocks.

import { jsPDF } from 'jspdf';

interface TopicPdfData {
  title: string;
  slug?: string;
  textContent: string;
  estimatedMinutes?: number;
  moduleTitle?: string;
}

// Colour palette matching on-screen notes
const COLORS = {
  // Brand
  sky400: [56, 189, 248] as [number, number, number],
  sky600: [2, 132, 199] as [number, number, number],
  sky700: [3, 105, 161] as [number, number, number],
  sky50: [240, 249, 255] as [number, number, number],

  // Emerald (TIP)
  emerald600: [5, 150, 105] as [number, number, number],
  emerald50: [236, 253, 245] as [number, number, number],
  emerald700: [4, 120, 87] as [number, number, number],

  // Amber (WARNING)
  amber500: [245, 158, 11] as [number, number, number],
  amber50: [255, 251, 235] as [number, number, number],
  amber700: [180, 83, 9] as [number, number, number],

  // Rose (IMPORTANT/CAUTION)
  rose500: [244, 63, 94] as [number, number, number],
  rose50: [255, 241, 242] as [number, number, number],
  rose700: [190, 18, 60] as [number, number, number],

  // Indigo (Blockquote)
  indigo500: [99, 102, 241] as [number, number, number],
  indigo50: [238, 242, 255] as [number, number, number],
  indigo700: [67, 56, 202] as [number, number, number],

  // Neutral
  slate900: [15, 23, 42] as [number, number, number],
  slate700: [51, 65, 85] as [number, number, number],
  slate500: [100, 116, 139] as [number, number, number],
  slate400: [148, 163, 184] as [number, number, number],
  slate200: [226, 232, 240] as [number, number, number],
  slate100: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  codeBlockBg: [15, 23, 42] as [number, number, number],
};

/**
 * Fetch the Waynautic logo and convert to a base64 data URL for embedding in the PDF.
 * Falls back to null if loading fails (header text only will be shown).
 */
async function fetchLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch('/waynautic-logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    }) || null;
  } catch {
    return null;
  }
}

export async function generateAndDownloadTopicPdf(topic: TopicPdfData): Promise<void> {
  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const marginTop = 22;
  const marginBottom = 18;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  // Helper to add a page and reset Y
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      drawPageHeader();
    }
  };

  // ─── Per-page header with logo ───
  const drawPageHeader = () => {
    // Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', marginX, 4, 28, 9);
      } catch {
        // fallback to text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.sky600);
        doc.text('WAYNAUTIC ACADEMY', marginX, 10);
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.sky600);
      doc.text('WAYNAUTIC ACADEMY', marginX, 10);
    }

    // Subtle right-aligned page descriptor
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slate400);
    const rightLabel = 'AI TRAINING CURRICULUM NOTES';
    const rightW = doc.getTextWidth(rightLabel);
    doc.text(rightLabel, pageWidth - marginX - rightW, 10);

    // Separator line
    doc.setDrawColor(...COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  // 1. Initial page header
  drawPageHeader();

  // 2. Title Banner
  doc.setFillColor(...COLORS.slate900);
  doc.roundedRect(marginX, currentY, contentWidth, 24, 3, 3, 'F');

  // Accent stripe on left side of banner
  doc.setFillColor(...COLORS.sky400);
  doc.rect(marginX, currentY, 3, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.sky400);
  doc.text('WAYNAUTIC ACADEMY', marginX + 8, currentY + 7);

  doc.setFontSize(13);
  doc.setTextColor(...COLORS.white);
  const truncatedTitle = topic.title.length > 52 ? `${topic.title.slice(0, 50)}...` : topic.title;
  doc.text(truncatedTitle, marginX + 8, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const metaText = `${topic.moduleTitle ? `${topic.moduleTitle}  •  ` : ''}${topic.estimatedMinutes || 15} mins read  •  Exported on ${new Date().toLocaleDateString()}`;
  doc.text(metaText, marginX + 8, currentY + 20);

  currentY += 30;

  // 3. Parse and Render Markdown Content
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
        // End code block — render buffered code
        inCodeBlock = false;
        if (codeBuffer.length > 0) {
          const codeBlockText = codeBuffer.join('\n');
          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          const wrappedCode = doc.splitTextToSize(codeBlockText, contentWidth - 10);
          const blockHeight = wrappedCode.length * 3.8 + 10;

          ensureSpace(blockHeight);

          // Dark code block background matching on-screen style
          doc.setFillColor(...COLORS.codeBlockBg);
          doc.roundedRect(marginX, currentY, contentWidth, blockHeight, 2, 2, 'F');

          // Colored code header bar
          doc.setFillColor(19, 27, 46); // #131B2E like on-screen
          doc.rect(marginX, currentY, contentWidth, 5, 'F');

          // Language label in header
          doc.setFont('courier', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(...COLORS.sky400);
          doc.text('CODE', marginX + 4, currentY + 3.5);

          // Traffic light dots
          doc.setFillColor(244, 63, 94);
          doc.circle(contentWidth + marginX - 14, currentY + 2.5, 1.2, 'F');
          doc.setFillColor(245, 158, 11);
          doc.circle(contentWidth + marginX - 10, currentY + 2.5, 1.2, 'F');
          doc.setFillColor(34, 197, 94);
          doc.circle(contentWidth + marginX - 6, currentY + 2.5, 1.2, 'F');

          doc.setFont('courier', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.sky400);
          let codeY = currentY + 9;
          for (const cLine of wrappedCode) {
            doc.text(cLine, marginX + 5, codeY);
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

    // Heading 1 — Masterclass header card
    if (trimmed.startsWith('# ')) {
      const hText = trimmed.replace(/^#\s+/, '').replace(/[*_]/g, '').replace(/🧠\s*/, '');
      ensureSpace(16);

      // Gradient-like header box
      doc.setFillColor(...COLORS.sky50);
      doc.roundedRect(marginX, currentY, contentWidth, 12, 2, 2, 'F');
      doc.setDrawColor(...COLORS.sky400);
      doc.setLineWidth(0.5);
      doc.roundedRect(marginX, currentY, contentWidth, 12, 2, 2, 'S');

      // Tag pill
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.sky600);
      doc.text('✦ MASTERCLASS TECHNICAL GUIDE', marginX + 4, currentY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.slate900);
      const h1Text = hText.replace(/^Masterclass:\s*/i, '');
      const wrappedH1 = doc.splitTextToSize(h1Text, contentWidth - 8);
      doc.text(wrappedH1[0] || h1Text, marginX + 4, currentY + 10);

      currentY += 16;
      continue;
    }

    // Heading 2 — Chapter headers with accent bar
    if (trimmed.startsWith('## ')) {
      const hText = trimmed.replace(/^##\s+/, '').replace(/[*_]/g, '');
      ensureSpace(14);

      // Accent bar
      doc.setFillColor(...COLORS.sky600);
      doc.rect(marginX, currentY, 2, 7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(...COLORS.slate900);
      const wrappedH2 = doc.splitTextToSize(hText, contentWidth - 8);
      doc.text(wrappedH2[0] || hText, marginX + 5, currentY + 5);

      // Bottom border
      doc.setDrawColor(...COLORS.slate200);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY + 8, pageWidth - marginX, currentY + 8);

      currentY += 12;
      continue;
    }

    // Heading 3 — Sub-topic
    if (trimmed.startsWith('### ')) {
      const hText = trimmed.replace(/^###\s+/, '').replace(/[*_]/g, '');
      ensureSpace(10);

      // Small bookmark icon (filled dot)
      doc.setFillColor(...COLORS.sky600);
      doc.circle(marginX + 1.5, currentY + 0.5, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.slate700);
      doc.text(hText, marginX + 5, currentY + 1.5);
      currentY += 6;
      continue;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      ensureSpace(4);
      // Gradient-style divider (dot dash dot)
      doc.setDrawColor(...COLORS.slate200);
      doc.setLineWidth(0.2);
      doc.line(marginX + 20, currentY + 1, pageWidth - marginX - 20, currentY + 1);
      currentY += 4;
      continue;
    }

    // Callouts / Alerts (> [!NOTE], etc.) — Color-coded boxes matching on-screen
    if (trimmed.startsWith('>')) {
      const calloutText = trimmed
        .replace(/^>\s*/, '')
        .replace(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/g, '$1:')
        .replace(/[*_]/g, '');

      let bgColor = COLORS.sky50;
      let borderColor = COLORS.sky600;
      let textColor = COLORS.sky700;
      let label = '';

      if (/^NOTE:/i.test(calloutText)) {
        bgColor = COLORS.sky50;
        borderColor = COLORS.sky600;
        textColor = COLORS.sky700;
        label = '📝 NOTE';
      } else if (/^TIP:/i.test(calloutText)) {
        bgColor = COLORS.emerald50;
        borderColor = COLORS.emerald600;
        textColor = COLORS.emerald700;
        label = '💡 TIP';
      } else if (/^WARNING:/i.test(calloutText)) {
        bgColor = COLORS.amber50;
        borderColor = COLORS.amber500;
        textColor = COLORS.amber700;
        label = '⚠️ WARNING';
      } else if (/^(?:IMPORTANT|CAUTION):/i.test(calloutText)) {
        bgColor = COLORS.rose50;
        borderColor = COLORS.rose500;
        textColor = COLORS.rose700;
        label = '🔴 IMPORTANT';
      } else {
        // Generic blockquote
        bgColor = COLORS.indigo50;
        borderColor = COLORS.indigo500;
        textColor = COLORS.indigo700;
      }

      const cleanCalloutText = label
        ? calloutText.replace(/^(?:NOTE|TIP|WARNING|IMPORTANT|CAUTION):\s*/i, '')
        : calloutText;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const wrappedCallout = doc.splitTextToSize(cleanCalloutText, contentWidth - 12);
      const labelHeight = label ? 4.5 : 0;
      const boxHeight = wrappedCallout.length * 4 + 6 + labelHeight;

      ensureSpace(boxHeight);

      // Box background
      doc.setFillColor(...bgColor);
      doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'F');

      // Left accent border
      doc.setFillColor(...borderColor);
      doc.rect(marginX, currentY, 2.5, boxHeight, 'F');

      // Label badge
      if (label) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...borderColor);
        doc.text(label, marginX + 5, currentY + 4);
      }

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);
      let calloutY = currentY + 4.5 + labelHeight;
      for (const cLine of wrappedCallout) {
        doc.text(cLine, marginX + 5, calloutY);
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
      doc.setTextColor(...COLORS.slate700);

      const wrappedBullet = doc.splitTextToSize(cleanBullet, contentWidth - 8);
      ensureSpace(wrappedBullet.length * 4.2 + 2);

      // Sky-colored bullet dot matching on-screen
      doc.setFillColor(...COLORS.sky600);
      doc.circle(marginX + 2, currentY - 1, 0.9, 'F');

      let bulletY = currentY;
      for (let b = 0; b < wrappedBullet.length; b++) {
        doc.text(wrappedBullet[b], marginX + 7, bulletY);
        bulletY += 4.2;
      }
      currentY = bulletY + 1.5;
      continue;
    }

    // Regular text paragraph
    const cleanParagraph = trimmed.replace(/[*_`]/g, '');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slate700);

    const wrappedParagraph = doc.splitTextToSize(cleanParagraph, contentWidth);
    ensureSpace(wrappedParagraph.length * 4.2 + 2);

    for (const pLine of wrappedParagraph) {
      doc.text(pLine, marginX, currentY);
      currentY += 4.2;
    }
    currentY += 2;
  }

  // 4. Number all pages in footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate400);

    // Footer divider line
    doc.setDrawColor(...COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    // Left footer text
    doc.text('Waynautic Academy • AI Engineering Portal', marginX, pageHeight - 8);

    // Right footer page count
    const pageStr = `Page ${p} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - marginX - pageStrWidth, pageHeight - 8);
  }

  // 5. Download file
  const safeFilename = (topic.slug || topic.title || 'lesson-notes')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`Waynautic-Notes-${safeFilename}.pdf`);
}

interface ModulePdfData {
  moduleTitle: string;
  moduleSlug: string;
  topics: Array<{
    title: string;
    slug?: string;
    textContent: string;
    estimatedMinutes?: number;
  }>;
}

export async function generateAndDownloadModulePdf(data: ModulePdfData): Promise<void> {
  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const marginTop = 22;
  const marginBottom = 18;
  const contentWidth = pageWidth - marginX * 2;

  let currentY = marginTop;

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', marginX, 4, 28, 9);
      } catch {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.sky600);
        doc.text('WAYNAUTIC ACADEMY', marginX, 10);
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.sky600);
      doc.text('WAYNAUTIC ACADEMY', marginX, 10);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slate400);
    const rightLabel = `${data.moduleTitle.toUpperCase()} QUICK REFERENCE`;
    const rightW = doc.getTextWidth(rightLabel);
    doc.text(rightLabel, pageWidth - marginX - rightW, 10);

    doc.setDrawColor(...COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, 14, pageWidth - marginX, 14);
  };

  drawPageHeader();

  // Title Banner
  doc.setFillColor(...COLORS.slate900);
  doc.roundedRect(marginX, currentY, contentWidth, 26, 3, 3, 'F');

  doc.setFillColor(...COLORS.sky400);
  doc.rect(marginX, currentY, 3, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.sky400);
  doc.text('WAYNAUTIC ACADEMY • FULL MODULE STUDY GUIDE', marginX + 8, currentY + 7);

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text(data.moduleTitle, marginX + 8, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const totalMins = data.topics.reduce((acc, t) => acc + (t.estimatedMinutes || 15), 0);
  doc.text(`Complete Quick-Reference • ${data.topics.length} Topic Lessons • ~${totalMins} mins total • Exported on ${new Date().toLocaleDateString()}`, marginX + 8, currentY + 22);

  currentY += 32;

  // Table of Contents
  ensureSpace(20);
  doc.setFillColor(...COLORS.sky600);
  doc.rect(marginX, currentY - 1, 2, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.slate900);
  doc.text('MODULE TABLE OF CONTENTS', marginX + 5, currentY + 4);
  doc.setDrawColor(...COLORS.slate200);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY + 6, pageWidth - marginX, currentY + 6);
  currentY += 10;

  data.topics.forEach((topic, idx) => {
    ensureSpace(6);
    doc.setFillColor(...COLORS.sky600);
    doc.circle(marginX + 2, currentY - 0.5, 0.9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slate700);
    doc.text(`Topic ${idx + 1 < 10 ? '0' : ''}${idx + 1}: ${topic.title}`, marginX + 6, currentY);
    currentY += 5;
  });

  currentY += 6;

  data.topics.forEach((topic, topicIdx) => {
    ensureSpace(20);

    doc.setFillColor(...COLORS.slate100);
    doc.roundedRect(marginX, currentY, contentWidth, 12, 2, 2, 'F');
    doc.setFillColor(...COLORS.sky600);
    doc.rect(marginX, currentY, 2.5, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.slate900);
    doc.text(`Lesson ${topicIdx + 1}: ${topic.title}`, marginX + 6, currentY + 8);
    currentY += 16;

    const rawContent = topic.textContent || '';
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

      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          if (codeBuffer.length > 0) {
            const codeBlockText = codeBuffer.join('\n');
            doc.setFont('courier', 'normal');
            doc.setFontSize(8);
            const wrappedCode = doc.splitTextToSize(codeBlockText, contentWidth - 10);
            const blockHeight = wrappedCode.length * 3.8 + 10;

            ensureSpace(blockHeight);

            doc.setFillColor(...COLORS.codeBlockBg);
            doc.roundedRect(marginX, currentY, contentWidth, blockHeight, 2, 2, 'F');

            doc.setFillColor(19, 27, 46);
            doc.rect(marginX, currentY, contentWidth, 5, 'F');

            doc.setFont('courier', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...COLORS.sky400);
            doc.text('CODE', marginX + 4, currentY + 3.5);

            doc.setFillColor(244, 63, 94);
            doc.circle(contentWidth + marginX - 14, currentY + 2.5, 1.2, 'F');
            doc.setFillColor(245, 158, 11);
            doc.circle(contentWidth + marginX - 10, currentY + 2.5, 1.2, 'F');
            doc.setFillColor(34, 197, 94);
            doc.circle(contentWidth + marginX - 6, currentY + 2.5, 1.2, 'F');

            doc.setFont('courier', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...COLORS.sky400);
            let codeY = currentY + 9;
            for (const cLine of wrappedCode) {
              doc.text(cLine, marginX + 5, codeY);
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

      if (!trimmed) {
        currentY += 2;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        const hText = trimmed.replace(/^#\s+/, '').replace(/[*_]/g, '').replace(/🧠\s*/, '');
        ensureSpace(14);

        doc.setFillColor(...COLORS.sky50);
        doc.roundedRect(marginX, currentY, contentWidth, 10, 2, 2, 'F');
        doc.setDrawColor(...COLORS.sky400);
        doc.setLineWidth(0.4);
        doc.roundedRect(marginX, currentY, contentWidth, 10, 2, 2, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.slate900);
        doc.text(hText.replace(/^Masterclass:\s*/i, ''), marginX + 4, currentY + 7);
        currentY += 13;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        const hText = trimmed.replace(/^##\s+/, '').replace(/[*_]/g, '');
        ensureSpace(12);

        doc.setFillColor(...COLORS.sky600);
        doc.rect(marginX, currentY, 2, 7, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.slate900);
        doc.text(hText, marginX + 5, currentY + 5);

        doc.setDrawColor(...COLORS.slate200);
        doc.setLineWidth(0.3);
        doc.line(marginX, currentY + 8, pageWidth - marginX, currentY + 8);

        currentY += 11;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        const hText = trimmed.replace(/^###\s+/, '').replace(/[*_]/g, '');
        ensureSpace(8);

        doc.setFillColor(...COLORS.sky600);
        doc.circle(marginX + 1.5, currentY + 0.5, 1, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLORS.slate700);
        doc.text(hText, marginX + 5, currentY + 1.5);
        currentY += 6;
        continue;
      }

      if (trimmed === '---' || trimmed === '***') {
        ensureSpace(4);
        doc.setDrawColor(...COLORS.slate200);
        doc.setLineWidth(0.2);
        doc.line(marginX + 20, currentY + 1, pageWidth - marginX - 20, currentY + 1);
        currentY += 4;
        continue;
      }

      if (trimmed.startsWith('>')) {
        const calloutText = trimmed
          .replace(/^>\s*/, '')
          .replace(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/g, '$1:')
          .replace(/[*_]/g, '');

        let bgColor = COLORS.sky50;
        let borderColor = COLORS.sky600;
        let textColor = COLORS.sky700;
        let label = '';

        if (/^NOTE:/i.test(calloutText)) {
          label = '📝 NOTE';
        } else if (/^TIP:/i.test(calloutText)) {
          bgColor = COLORS.emerald50;
          borderColor = COLORS.emerald600;
          textColor = COLORS.emerald700;
          label = '💡 TIP';
        } else if (/^WARNING:/i.test(calloutText)) {
          bgColor = COLORS.amber50;
          borderColor = COLORS.amber500;
          textColor = COLORS.amber700;
          label = '⚠️ WARNING';
        } else if (/^(?:IMPORTANT|CAUTION):/i.test(calloutText)) {
          bgColor = COLORS.rose50;
          borderColor = COLORS.rose500;
          textColor = COLORS.rose700;
          label = '🔴 IMPORTANT';
        } else {
          bgColor = COLORS.indigo50;
          borderColor = COLORS.indigo500;
          textColor = COLORS.indigo700;
        }

        const cleanCalloutText = label
          ? calloutText.replace(/^(?:NOTE|TIP|WARNING|IMPORTANT|CAUTION):\s*/i, '')
          : calloutText;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        const wrappedCallout = doc.splitTextToSize(cleanCalloutText, contentWidth - 12);
        const labelHeight = label ? 4.5 : 0;
        const boxHeight = wrappedCallout.length * 4 + 6 + labelHeight;

        ensureSpace(boxHeight);

        doc.setFillColor(...bgColor);
        doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'F');

        doc.setFillColor(...borderColor);
        doc.rect(marginX, currentY, 2.5, boxHeight, 'F');

        if (label) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(...borderColor);
          doc.text(label, marginX + 5, currentY + 4);
        }

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...textColor);
        let calloutY = currentY + 4.5 + labelHeight;
        for (const cLine of wrappedCallout) {
          doc.text(cLine, marginX + 5, calloutY);
          calloutY += 4;
        }

        currentY += boxHeight + 4;
        continue;
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
        const cleanBullet = trimmed.replace(/^([-*]|\d+\.)\s+/, '').replace(/[*_`]/g, '');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.slate700);

        const wrappedBullet = doc.splitTextToSize(cleanBullet, contentWidth - 8);
        ensureSpace(wrappedBullet.length * 4.2 + 2);

        doc.setFillColor(...COLORS.sky600);
        doc.circle(marginX + 2, currentY - 1, 0.9, 'F');

        let bulletY = currentY;
        for (let b = 0; b < wrappedBullet.length; b++) {
          doc.text(wrappedBullet[b], marginX + 7, bulletY);
          bulletY += 4.2;
        }
        currentY = bulletY + 1.5;
        continue;
      }

      const cleanParagraph = trimmed.replace(/[*_`]/g, '');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.slate700);

      const wrappedParagraph = doc.splitTextToSize(cleanParagraph, contentWidth);
      ensureSpace(wrappedParagraph.length * 4.2 + 2);

      for (const pLine of wrappedParagraph) {
        doc.text(pLine, marginX, currentY);
        currentY += 4.2;
      }
      currentY += 2;
    }

    currentY += 8;
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate400);

    doc.setDrawColor(...COLORS.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.text(`Waynautic Academy • ${data.moduleTitle} Quick-Reference`, marginX, pageHeight - 8);

    const pageStr = `Page ${p} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - marginX - pageStrWidth, pageHeight - 8);
  }

  const safeFilename = (data.moduleSlug || data.moduleTitle || 'module-notes')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`Waynautic-Module-Guide-${safeFilename}.pdf`);
}
