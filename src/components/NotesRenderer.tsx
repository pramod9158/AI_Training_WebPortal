'use client';

import React, { useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  AlertCircle, 
  FileCode,
  Bookmark,
  Quote,
  Clock,
  BookOpen
} from 'lucide-react';
import { convertMarkdownToVisualNotes } from '@/lib/visualNotesConverter';

export interface NotesRendererProps {
  content: string;
  topicTitle?: string;
  moduleTitle?: string;
  estimatedMinutes?: number;
  isPrint?: boolean;
  onRendered?: () => void;
}

export const NotesRenderer: React.FC<NotesRendererProps> = ({
  content = '',
  topicTitle = 'Topic Notes',
  moduleTitle,
  estimatedMinutes,
  isPrint = false,
  onRendered,
}) => {
  const isHtmlContent = 
    content.trim().startsWith('<!DOCTYPE') ||
    content.trim().startsWith('<html') ||
    content.trim().startsWith('<div') ||
    content.trim().startsWith('<article') ||
    ((content.includes('<p>') || content.includes('<h2>') || content.includes('<h3>')) && !content.trim().startsWith('#'));

  // Ensure any plain, raw, or unformatted notes are converted into rich Masterclass visual format
  const displayContent = useMemo(() => {
    if (!content) return '';
    if (isHtmlContent) return content;
    const isAlreadyFormatted = 
      /#\s*.*Masterclass/i.test(content) && 
      /\[!(?:IMPORTANT|NOTE|TIP)\]/i.test(content) && 
      /##\s*.*(?:Mind Map|Chapter)/i.test(content);
    if (!isAlreadyFormatted) {
      return convertMarkdownToVisualNotes(content, topicTitle);
    }
    return content;
  }, [content, topicTitle, isHtmlContent]);

  useEffect(() => {
    if (onRendered) {
      // Allow frame to paint
      requestAnimationFrame(() => {
        setTimeout(onRendered, 80);
      });
    }
  }, [onRendered, displayContent]);

  return (
    <div className={`notes-content-container w-full ${isPrint ? 'bg-white text-slate-900' : 'text-slate-800 dark:text-slate-200'}`}>
      
      {/* Printable Cover Header (Included on the first page of downloaded notes) */}
      {isPrint && (
        <div className="printable-doc-header pb-6 mb-7 border-b-2 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/waynautic-logo.png"
                alt="Waynautic Academy"
                className="h-10 w-auto object-contain max-h-10"
                crossOrigin="anonymous"
              />
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-mono font-bold tracking-wider uppercase border border-sky-300">
                Official Curriculum Notes
              </span>
              <div className="text-[11px] text-slate-500 font-medium mt-1 font-mono">
                Waynautic Academy • AI Training Program
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-semibold text-slate-800">{moduleTitle || 'AI Engineering Curriculum'}</span>
            </div>
            {estimatedMinutes && (
              <div className="flex items-center space-x-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{estimatedMinutes} mins read</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body: Renders either rich HTML notes or Markdown notes */}
      {isHtmlContent ? (
        <article 
          className="prose max-w-none text-slate-700 dark:text-slate-200 prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-extrabold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-a:text-sky-600 dark:prose-a:text-cyan-400 hover:prose-a:underline prose-code:text-sky-700 dark:prose-code:text-cyan-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-200 dark:prose-code:border-slate-800 prose-ul:text-xs sm:prose-ul:text-sm prose-ol:text-xs sm:prose-ol:text-sm"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      ) : (
        <article className="prose max-w-none text-slate-700 dark:text-slate-200 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-a:text-sky-600 dark:prose-a:text-cyan-400 hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Masterclass Header Card (h1)
              h1({ children }) {
                return (
                  <div className="my-5 p-3.5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-violet-50 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-violet-950/40 border-2 border-sky-200/80 dark:border-cyan-500/30 shadow-md">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-cyan-400/10 border border-sky-400/30 dark:border-cyan-400/30 text-sky-700 dark:text-cyan-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                      <span>Masterclass Technical Guide</span>
                    </div>
                    <h1 className="text-lg xs:text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight m-0 tracking-tight break-words">
                      {children}
                    </h1>
                  </div>
                );
              },

              // Chapter & Section Headers (h2)
              h2({ children }) {
                return (
                  <div className="mt-8 mb-4 pt-2">
                    <div className="flex items-center space-x-3 pb-2 border-b-2 border-slate-200 dark:border-slate-800">
                      <div className="w-1.5 h-6 sm:h-7 rounded-full bg-gradient-to-b from-sky-500 to-indigo-600 dark:from-cyan-400 dark:to-blue-600 shrink-0" />
                      <h2 className="text-base xs:text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0 flex items-center gap-2 break-words">
                        {children}
                      </h2>
                    </div>
                  </div>
                );
              },

              // Sub-topic Headers (h3)
              h3({ children }) {
                return (
                  <div className="mt-6 mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 m-0">
                      <Bookmark className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                      <span>{children}</span>
                    </h3>
                  </div>
                );
              },

              // Decorative Horizontal Divider (hr)
              hr() {
                return <div className="my-8 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />;
              },

              // Custom High-Contrast Bullet Lists
              ul({ children }) {
                return <ul className="my-3 space-y-2 pl-0 list-none text-xs sm:text-sm">{children}</ul>;
              },

              ol({ children }) {
                return <ol className="my-3 space-y-2 pl-0 list-none text-xs sm:text-sm">{children}</ol>;
              },

              li({ children }) {
                return (
                  <li className="flex items-start space-x-2.5 my-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-cyan-400 shrink-0 mt-2" />
                    <div className="flex-1">{children}</div>
                  </li>
                );
              },

              // High-Contrast Bold Text
              strong({ children }) {
                return <strong className="font-extrabold text-slate-900 dark:text-white">{children}</strong>;
              },

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
                    <div className="my-4 p-4 rounded-2xl bg-sky-50/90 dark:bg-cyan-950/40 border border-sky-200 dark:border-cyan-500/30 border-l-4 border-l-sky-500 dark:border-l-cyan-400 text-sky-900 dark:text-cyan-200 flex items-start space-x-3 text-xs sm:text-sm shadow-sm">
                      <Info className="w-5 h-5 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                    </div>
                  );
                }

                if (childrenText.includes('[!TIP]')) {
                  return (
                    <div className="my-4 p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 border-l-4 border-l-emerald-500 dark:border-l-emerald-400 text-emerald-900 dark:text-emerald-200 flex items-start space-x-3 text-xs sm:text-sm shadow-sm">
                      <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                    </div>
                  );
                }

                if (childrenText.includes('[!WARNING]')) {
                  return (
                    <div className="my-4 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 border-l-4 border-l-amber-500 dark:border-l-amber-400 text-amber-900 dark:text-amber-200 flex items-start space-x-3 text-xs sm:text-sm shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                    </div>
                  );
                }

                if (childrenText.includes('[!IMPORTANT]') || childrenText.includes('[!CAUTION]')) {
                  return (
                    <div className="my-4 p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 border-l-4 border-l-rose-500 dark:border-l-rose-400 text-rose-900 dark:text-rose-200 flex items-start space-x-3 text-xs sm:text-sm shadow-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                    </div>
                  );
                }

                return (
                  <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-500 text-slate-700 dark:text-slate-300 flex items-start space-x-3 text-xs sm:text-sm italic">
                    <Quote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                  </div>
                );
              },

              // Responsive Tables with Horizontal Scroll
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
                        <div className="flex items-center space-x-1.5 opacity-90">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="flex items-center space-x-1.5 pl-2 border-l border-slate-700/60">
                          <FileCode className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-bold uppercase tracking-wider text-sky-300">{displayLabel}</span>
                        </span>
                      </div>
                    </div>
                    <pre className="notes-code-pre p-3 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-slate-100 bg-[#0A0F1D] m-0 leading-relaxed scrollbar-thin">
                      <code className="font-mono leading-relaxed block tracking-normal whitespace-pre text-slate-100">
                        {renderHighlighted()}
                      </code>
                    </pre>
                  </div>
                );
              }
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </article>
      )}

    </div>
  );
};
