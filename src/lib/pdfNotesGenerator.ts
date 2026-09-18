// Waynautic Academy - High-Fidelity PDF Notes Generator
// Generates pixel-perfect "photocopy-grade" downloadable PDF notes matching the web portal screen.
// Features:
// 1. Waynautic logo at the top and running headers.
// 2. 100% exact rendering of ASCII mind maps, box-drawing Unicode characters, emojis, and callouts.
// 3. Smart section-aware pagination that avoids awkward cuts through code blocks, headings, or callouts.
// 4. Compact, high-DPI (Retina 2x) vector-crisp output.

import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { NotesRenderer } from '@/components/NotesRenderer';

export interface TopicPdfData {
  title: string;
  slug?: string;
  textContent: string;
  estimatedMinutes?: number;
  moduleTitle?: string;
}

export interface ModulePdfData {
  moduleTitle: string;
  moduleSlug?: string;
  topics: Array<{
    title: string;
    slug?: string;
    textContent: string;
    estimatedMinutes?: number;
  }>;
}

/**
 * Fetch the Waynautic logo and convert to a base64 data URL for embedding in the PDF running header.
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

interface PageSlice {
  startY: number;
  endY: number;
}

/**
 * Helper to measure DOM elements inside container and calculate intelligent page breaks
 * so headings, paragraphs, callout boxes, and code blocks don't get cut in half.
 */
function computeSmartPageSlices(container: HTMLElement, maxPageHeightPx: number, firstPageMaxPx: number): PageSlice[] {
  const containerTop = container.getBoundingClientRect().top;
  const totalHeight = container.scrollHeight;

  // Collect candidate break elements
  const elements = Array.from(container.querySelectorAll(
    '.printable-doc-header, article > div, article > p, article > ul, article > ol, article > pre, article > blockquote, article > table, .notes-code-wrapper'
  )) as HTMLElement[];

  interface BlockBoundary {
    top: number;
    bottom: number;
    height: number;
    isHeading: boolean;
  }

  const boundaries: BlockBoundary[] = [];
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    const top = rect.top - containerTop;
    const height = rect.height;
    if (height <= 0) continue;

    const isHeading = 
      el.tagName.startsWith('H') || 
      !!el.querySelector('h1, h2, h3, h4') || 
      el.classList.contains('printable-doc-header');

    boundaries.push({
      top,
      bottom: top + height,
      height,
      isHeading,
    });
  }

  // Sort by top ascending
  boundaries.sort((a, b) => a.top - b.top);

  const slices: PageSlice[] = [];
  let currentY = 0;
  let pageIdx = 0;

  while (currentY < totalHeight) {
    const pageAllowedPx = pageIdx === 0 ? firstPageMaxPx : maxPageHeightPx;
    const targetEndY = currentY + pageAllowedPx;

    if (targetEndY >= totalHeight) {
      slices.push({ startY: currentY, endY: totalHeight });
      break;
    }

    let bestBreakY = targetEndY;
    let foundCleanBreak = false;

    // Check boundaries crossing targetEndY
    for (const b of boundaries) {
      // If a block crosses the target page boundary
      if (b.top < targetEndY && b.bottom > targetEndY) {
        if (b.top > currentY + 120) {
          bestBreakY = b.top;
          foundCleanBreak = true;
          break;
        } else {
          // Block is taller than remaining page space; try to break at inner line/item
          const innerItems = Array.from(b.isHeading ? [] : container.querySelectorAll('pre code span, tr, li, p')) as HTMLElement[];
          for (const inner of innerItems) {
            const innerRect = inner.getBoundingClientRect();
            const innerTop = innerRect.top - containerTop;
            if (innerTop > currentY + 120 && innerTop < targetEndY) {
              bestBreakY = innerTop;
              foundCleanBreak = true;
            }
          }
          if (foundCleanBreak) break;
        }
      }

      // Avoid leaving an orphaned heading at the very bottom edge of the page
      if (b.isHeading && b.top > targetEndY - 50 && b.top < targetEndY && b.top > currentY + 150) {
        bestBreakY = b.top;
        foundCleanBreak = true;
        break;
      }
    }

    if (!foundCleanBreak) {
      bestBreakY = targetEndY;
    }

    slices.push({ startY: currentY, endY: bestBreakY });
    currentY = bestBreakY;
    pageIdx++;
  }

  return slices;
}

/**
 * Render an HTML notes element offscreen, capture with html2canvas, and append slices to jsPDF.
 */
async function renderTopicToPdf(
  doc: jsPDF,
  topic: TopicPdfData,
  logoBase64: string | null,
  isFirstTopic: boolean = true
): Promise<void> {
  const container = document.createElement('div');
  container.id = 'pdf-render-offscreen-stage';
  
  // Set fixed width matching A4 portrait printable ratio at 96 DPI
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '820px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.zIndex = '-9999';
  container.style.boxSizing = 'border-box';
  container.style.padding = '24px 28px';
  container.style.opacity = '1';
  container.className = 'light bg-white text-slate-900';

  document.body.appendChild(container);

  // Temporarily remove dark class on <html> to ensure standard crisp white print styling
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    document.documentElement.classList.remove('dark');
  }

  try {
    // Mount the exact NotesRenderer component
    const root = createRoot(container);
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(NotesRenderer, {
          content: topic.textContent || '',
          topicTitle: topic.title,
          moduleTitle: topic.moduleTitle,
          estimatedMinutes: topic.estimatedMinutes,
          isPrint: true,
          onRendered: () => resolve(),
        })
      );
    });

    // Ensure all images are loaded
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });
      })
    );

    // Ensure system/web fonts are ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Small delay to allow full painting and layout
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 140)));

    // Measure and compute intelligent page slices
    // A4 Portrait dimensions: 210mm x 297mm
    const marginX = 14; // mm
    const printableWidthMm = 210 - marginX * 2; // 182mm
    const mmPerPx = printableWidthMm / 820; // ~0.22195 mm per CSS pixel

    // Content height limits in pixels
    // First page: has header banner at top, footer at bottom
    // Usable height: 297mm - 14mm top - 18mm bottom = 265mm
    const maxPageHeightPx = Math.round(258 / mmPerPx); // ~1162px
    const firstPageMaxPx = Math.round(262 / mmPerPx);

    const slices = computeSmartPageSlices(container, maxPageHeightPx, firstPageMaxPx);

    // Rasterize with html2canvas at scale 2 (Retina crispness)
    const fullCanvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
    });

    const totalPages = slices.length;

    // Write each slice to jsPDF
    for (let i = 0; i < totalPages; i++) {
      const slice = slices[i];
      const sliceHeightPx = slice.endY - slice.startY;
      if (sliceHeightPx <= 0) continue;

      if (!isFirstTopic || i > 0) {
        doc.addPage();
      }

      const pageNum = doc.getNumberOfPages();

      // Top running header (Pages 2+)
      if (i > 0) {
        if (logoBase64) {
          try {
            doc.addImage(logoBase64, 'PNG', marginX, 6, 26, 8);
          } catch {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(2, 132, 199);
            doc.text('WAYNAUTIC ACADEMY', marginX, 11);
          }
        } else {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(2, 132, 199);
          doc.text('WAYNAUTIC ACADEMY', marginX, 11);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const rightLabel = (topic.title || 'AI TECHNICAL NOTES').toUpperCase();
        const truncatedLabel = rightLabel.length > 50 ? `${rightLabel.slice(0, 48)}...` : rightLabel;
        const rw = doc.getTextWidth(truncatedLabel);
        doc.text(truncatedLabel, 210 - marginX - rw, 11);

        // Header divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, 16, 210 - marginX, 16);
      }

      // Slice canvas chunk
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = fullCanvas.width;
      pageCanvas.height = Math.round(sliceHeightPx * 2);

      const pctx = pageCanvas.getContext('2d');
      if (pctx) {
        pctx.fillStyle = '#ffffff';
        pctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pctx.drawImage(
          fullCanvas,
          0, Math.round(slice.startY * 2), fullCanvas.width, pageCanvas.height,
          0, 0, pageCanvas.width, pageCanvas.height
        );
      }

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const imgHeightMm = sliceHeightPx * mmPerPx;
      const contentTopMm = i === 0 ? 12 : 18;

      doc.addImage(imgData, 'JPEG', marginX, contentTopMm, printableWidthMm, imgHeightMm);

      // Bottom running footer on every page
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, 285, 210 - marginX, 285);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('WAYNAUTIC ACADEMY • CONFIDENTIAL & PROPRIETARY STUDY MATERIAL', marginX, 290);

      const pageText = `Page ${pageNum}`;
      const pw = doc.getTextWidth(pageText);
      doc.text(pageText, 210 - marginX - pw, 290);
    }

    // Cleanup root
    root.unmount();
  } finally {
    // Restore dark mode if it was previously active
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    // Remove temporary container
    container.remove();
  }
}

/**
 * Generate and download a pixel-perfect PDF of a single topic's notes.
 */
export async function generateAndDownloadTopicPdf(topic: TopicPdfData): Promise<void> {
  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  await renderTopicToPdf(doc, topic, logoBase64, true);

  const cleanSlug = (topic.slug || topic.title || 'Topic')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);

  doc.save(`Waynautic_Notes_${cleanSlug}.pdf`);
}

/**
 * Generate and download a pixel-perfect PDF containing all topics in a module.
 */
export async function generateAndDownloadModulePdf(data: ModulePdfData): Promise<void> {
  const logoBase64 = await fetchLogoBase64();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const topics = data.topics || [];
  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    await renderTopicToPdf(
      doc,
      {
        title: t.title,
        slug: t.slug,
        textContent: t.textContent,
        estimatedMinutes: t.estimatedMinutes,
        moduleTitle: data.moduleTitle,
      },
      logoBase64,
      i === 0
    );
  }

  const cleanModuleSlug = (data.moduleSlug || data.moduleTitle || 'Module')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);

  doc.save(`Waynautic_${cleanModuleSlug}_Full_Notes.pdf`);
}
