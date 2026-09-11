'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  AlertCircle, 
  FileCode,
  Download,
  Loader2
} from 'lucide-react';
import { generateAndDownloadTopicPdf } from '@/lib/pdfNotesGenerator';

interface MarkdownNotesProps {
  content: string;
  topicTitle?: string;
  topicSlug?: string;
  moduleTitle?: string;
  estimatedMinutes?: number;
}

export const MarkdownNotes: React.FC<MarkdownNotesProps> = ({ 
  content,
  topicTitle = 'Topic Notes',
  topicSlug,
  moduleTitle,
  estimatedMinutes
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      generateAndDownloadTopicPdf({
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

  const isHtmlContent = 
    content.trim().startsWith('<!DOCTYPE') ||
    content.trim().startsWith('<html') ||
    content.trim().startsWith('<div') ||
    content.trim().startsWith('<article') ||
    ((content.includes('<p>') || content.includes('<h2>') || content.includes('<h3>')) && !content.trim().startsWith('#'));

  return (
    <div className="w-full bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-xl text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
          <span className="truncate">Topic Text Notes & Technical Specifications</span>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/80 border border-sky-300 dark:border-cyan-500/40 text-sky-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-sm active:scale-95 self-start sm:self-auto min-h-[34px]"
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

      {/* Body: Renders either rich HTML notes or Markdown notes */}
      {isHtmlContent ? (
        <article 
          className="prose max-w-none text-slate-700 dark:text-slate-200 prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-extrabold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-a:text-sky-600 dark:prose-a:text-cyan-400 hover:prose-a:underline prose-code:text-sky-700 dark:prose-code:text-cyan-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-200 dark:prose-code:border-slate-800 prose-ul:text-xs sm:prose-ul:text-sm prose-ol:text-xs sm:prose-ol:text-sm"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <article className="prose max-w-none text-slate-700 dark:text-slate-200 prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-extrabold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-a:text-sky-600 dark:prose-a:text-cyan-400 hover:prose-a:underline prose-ul:text-xs sm:prose-ul:text-sm prose-ol:text-xs sm:prose-ol:text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
          components={{
            // Custom Callouts / Alerts for Blockquotes
            blockquote({ children }) {
              const childrenText = React.Children.toArray(children)
                .map((child: any) => {
                  if (typeof child === 'string') return child;
                  if (child?.props?.children) {
                    return Array.isArray(child.props.children)
                      ? child.props.children.join('')
                      : String(child.props.children);
                  }
                  return '';
                })
                .join('');

              if (childrenText.includes('[!NOTE]')) {
                return (
                  <div className="my-4 p-4 rounded-2xl bg-sky-50 dark:bg-cyan-950/40 border-l-4 border-sky-500 dark:border-cyan-400 text-sky-900 dark:text-cyan-200 flex items-start space-x-3 text-xs sm:text-sm">
                    <Info className="w-5 h-5 text-sky-500 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed">{children}</div>
                  </div>
                );
              }

              if (childrenText.includes('[!TIP]')) {
                return (
                  <div className="my-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 dark:border-emerald-400 text-emerald-900 dark:text-emerald-200 flex items-start space-x-3 text-xs sm:text-sm">
                    <Lightbulb className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed">{children}</div>
                  </div>
                );
              }

              if (childrenText.includes('[!WARNING]')) {
                return (
                  <div className="my-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 dark:border-amber-400 text-amber-900 dark:text-amber-200 flex items-start space-x-3 text-xs sm:text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed">{children}</div>
                  </div>
                );
              }

              if (childrenText.includes('[!IMPORTANT]') || childrenText.includes('[!CAUTION]')) {
                return (
                  <div className="my-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 dark:border-rose-400 text-rose-900 dark:text-rose-200 flex items-start space-x-3 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed">{children}</div>
                  </div>
                );
              }

              return (
                <blockquote className="my-4 pl-4 border-l-4 border-slate-300 dark:border-slate-700 italic text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  {children}
                </blockquote>
              );
            },

            // Responsive Tables with Horizontal Scroll
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                    {children}
                  </table>
                </div>
              );
            },

            // Syntax Code Blocks & Inline Chips with high-contrast diagram rendering
            code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              const codeString = String(children).replace(/\n$/, '');
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !codeString.includes('\n');

              if (isInline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-slate-300 dark:border-slate-800 before:content-none after:content-none" {...props}>
                    {children}
                  </code>
                );
              }

              const languageLabel = match ? match[1] : 'code';
              const isDiagram = /[┌┐└┘├┤┬┴┼─│▼▲►◄═║╔╗╚╝]/.test(codeString);
              const displayLabel = isDiagram 
                ? 'Architecture Mind Map' 
                : languageLabel === 'text' 
                ? 'Plain Text' 
                : languageLabel;

              // Renders ASCII box characters in sky-400 and text labels in bright white
              const renderHighlighted = () => {
                if (isDiagram) {
                  const lines = codeString.split('\n');
                  return lines.map((line, lineIdx) => {
                    const parts: React.ReactNode[] = [];
                    let currentSeg = '';
                    let isBox = false;

                    for (let i = 0; i < line.length; i++) {
                      const c = line[i];
                      const isBoxChar = /[┌┐└┘├┤┬┴┼─│▼▲►◄═║╔╗╚╝]/.test(c);

                      if (i === 0) {
                        isBox = isBoxChar;
                        currentSeg = c;
                      } else if (isBoxChar === isBox) {
                        currentSeg += c;
                      } else {
                        parts.push(
                          <span
                            key={`${lineIdx}-${parts.length}`}
                            className={isBox ? 'text-sky-400 font-bold' : 'text-slate-100 font-semibold'}
                          >
                            {currentSeg}
                          </span>
                        );
                        isBox = isBoxChar;
                        currentSeg = c;
                      }
                    }

                    if (currentSeg) {
                      parts.push(
                        <span
                          key={`${lineIdx}-${parts.length}`}
                          className={isBox ? 'text-sky-400 font-bold' : 'text-slate-100 font-semibold'}
                        >
                          {currentSeg}
                        </span>
                      );
                    }

                    return (
                      <React.Fragment key={lineIdx}>
                        {parts}
                        {lineIdx < lines.length - 1 ? '\n' : ''}
                      </React.Fragment>
                    );
                  });
                }

                // General code lines (Python, Bash, JS, etc.)
                const lines = codeString.split('\n');
                return lines.map((line, lineIdx) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
                    return (
                      <span key={lineIdx} className="text-slate-400 italic">
                        {line}
                        {lineIdx < lines.length - 1 ? '\n' : ''}
                      </span>
                    );
                  }
                  return (
                    <span key={lineIdx} className="text-slate-100">
                      {line}
                      {lineIdx < lines.length - 1 ? '\n' : ''}
                    </span>
                  );
                });
              };

              return (
                <div className="notes-code-wrapper relative group my-5 rounded-2xl overflow-hidden border-2 border-slate-700/80 dark:border-slate-800 bg-[#0A0F1D] shadow-xl">
                  <div className="notes-code-header flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-[#131B2E] border-b border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300">
                    <div className="flex items-center space-x-2.5">
                      <div className="flex items-center space-x-1.5 opacity-80">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="flex items-center space-x-1.5 pl-2 border-l border-slate-700/60">
                        <FileCode className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-bold uppercase tracking-wider text-sky-300">{displayLabel}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(codeString)}
                      className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-colors text-xs font-medium"
                      title="Copy code or diagram"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="notes-code-pre p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-slate-100 bg-[#0A0F1D] m-0 leading-relaxed scrollbar-thin">
                    <code className="font-mono leading-relaxed block tracking-normal whitespace-pre text-slate-100">
                      {renderHighlighted()}
                    </code>
                  </pre>
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
      )}

    </div>
  );
};
