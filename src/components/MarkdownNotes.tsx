'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Download,
  Loader2
} from 'lucide-react';
import { generateAndDownloadTopicPdf } from '@/lib/pdfNotesGenerator';
import { NotesRenderer } from '@/components/NotesRenderer';

interface MarkdownNotesProps {
  content: string;
  topicTitle?: string;
  topicSlug?: string;
  moduleTitle?: string;
  estimatedMinutes?: number;
}

export const MarkdownNotes: React.FC<MarkdownNotesProps> = ({ 
  content = '',
  topicTitle = 'Topic Notes',
  topicSlug,
  moduleTitle,
  estimatedMinutes
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateAndDownloadTopicPdf({
        title: topicTitle,
        slug: topicSlug,
        textContent: content,
        estimatedMinutes,
        moduleTitle
      });
    } catch (err) {
      console.error('Failed to generate PDF notes:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 shadow-xl text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
          <span className="truncate">Topic Text Notes & Technical Specifications</span>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center space-x-2 px-3.5 py-2 sm:py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/80 border border-sky-300 dark:border-cyan-500/40 text-sky-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-sm active:scale-95 self-start sm:self-auto min-h-[38px] sm:min-h-[34px]"
          title="Download formatted PDF notes for offline study"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-cyan-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
          )}
          <span>{isGeneratingPdf ? 'Exporting PDF...' : 'Download Notes (PDF)'}</span>
        </button>
      </div>

      {/* Body: Rendered via NotesRenderer */}
      <NotesRenderer
        content={content}
        topicTitle={topicTitle}
        moduleTitle={moduleTitle}
        estimatedMinutes={estimatedMinutes}
        isPrint={false}
      />

    </div>
  );
};
