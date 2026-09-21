'use client';

import React, { useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  AlertCircle, 
  FileCode,
  Bookmark,
  Quote
} from 'lucide-react';
import { cleanNotesContent } from '@/lib/visualNotesConverter';
import { getAllTopics } from '@/lib/curriculumService';
import { MODULES } from '@/data/seedModules';

export interface NotesRendererProps {
  content: string;
  topicTitle?: string;
  moduleTitle?: string;
  estimatedMinutes?: number;
  isPrint?: boolean;
  onRendered?: () => void;
}

/**
 * Strips raw alert tags like [!NOTE], [!TIP], [!WARNING] from children so they don't display as raw text.
 */
function cleanAlertChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!child) return child;
    if (typeof child === 'string') {
      return child.replace(/^\s*\[!(?:NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '');
    }
    if (React.isValidElement(child) && (child.props as any)?.children) {
      return React.cloneElement(child as React.ReactElement<any>, {
        children: cleanAlertChildren((child.props as any).children),
      });
    }
    return child;
  });
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

  // Strictly preserve user content without injecting fake mind maps, chapters, or takeaways
  const displayContent = useMemo(() => {
    if (!content) return '';
    if (isHtmlContent) return content;
    return cleanNotesContent(content);
  }, [content, isHtmlContent]);

  // Resolve module title to always display module name (not individual topic name)
  const displayModuleTitle = useMemo(() => {
    if (moduleTitle && moduleTitle.trim() && moduleTitle !== 'Module') {
      return moduleTitle;
    }
    try {
      const allTopics = getAllTopics();
      const found = allTopics.find(
        (t) => topicTitle && t.title.toLowerCase() === topicTitle.toLowerCase()
      );
      if (found && found.moduleSlug) {
        const mod = MODULES.find((m) => m.slug === found.moduleSlug);
        if (mod) return mod.title;
      }
    } catch {
      // ignore
    }
    return 'Prompt Engineering';
  }, [moduleTitle, topicTitle]);

  useEffect(() => {
    if (onRendered) {
      requestAnimationFrame(() => {
        setTimeout(onRendered, 80);
      });
    }
  }, [onRendered, displayContent]);

  return (
    <div className={`notes-content-container w-full ${isPrint ? 'bg-white text-slate-900' : 'text-slate-800 dark:text-slate-200'}`}>
      
      {/* Printable Cover Header (Included on downloaded PDF notes) */}
      {isPrint && (
        <div className="printable-doc-header pb-2.5 mb-5 border-b-2 border-slate-200 bg-white">
          {/* Row 1: Logo on Left aligned with Waynautic Academy on Right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center h-7">
              <img
                src="/waynautic-logo.png"
                alt="Waynautic"
                className="h-6 w-auto object-contain max-h-6"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex items-center h-7 text-right">
              <span className="text-sm font-bold text-slate-900 font-mono tracking-wide leading-none">
                Waynautic Academy
              </span>
            </div>
          </div>

          {/* Row 2: Company Subtitle on Left aligned with Module Title on Right */}
          <div className="flex items-center justify-between mt-1 pt-0.5">
            <span className="text-[10px] text-slate-500 font-medium font-mono tracking-wide leading-none">
              Waynautic Technologies Pvt Ltd
            </span>
            <span className="text-[10px] text-slate-600 font-medium font-mono text-right leading-none">
              {displayModuleTitle}
            </span>
          </div>
        </div>
      )}

      {/* Body: Renders either rich HTML notes or clean Markdown notes */}
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
              // Document Title Header (h1)
              h1({ children }) {
                return (
                  <div className="my-4 pb-2.5 border-b-2 border-slate-200 dark:border-slate-800">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight m-0 tracking-tight break-words">
                      {children}
                    </h1>
                  </div>
                );
              },

              // Section Headers (h2) - Clean, proportional spacing
              h2({ children }) {
                return (
                  <div className="notes-h2-section mt-5 mb-2.5 pt-1">
                    <div className="flex items-center space-x-2.5 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      <div className="w-1 h-5 rounded-full bg-sky-500 dark:bg-cyan-400 shrink-0" />
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0 break-words">
                        {children}
                      </h2>
                    </div>
                  </div>
                );
              },

              // Sub-section Headers (h3)
              h3({ children }) {
                return (
                  <div className="mt-3.5 mb-1.5">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2 m-0">
                      <Bookmark className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                      <span>{children}</span>
                    </h3>
                  </div>
                );
              },

              // Paragraphs
              p({ children }) {
                return (
                  <p className="my-2 leading-[1.75] text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {children}
                  </p>
                );
              },

              // Divider
              hr() {
                return <div className="my-4 h-px bg-slate-200 dark:bg-slate-800" />;
              },

              // Custom High-Contrast Bullet Lists (ul)
              ul({ children }) {
                return <ul className="my-2.5 space-y-1.5 pl-1 text-xs sm:text-sm">{children}</ul>;
              },

              // Numbered Lists (ol) - Keeps standard numbers intact (1., 2., 3.)
              ol({ children }) {
                return (
                  <ol className="my-2.5 space-y-1.5 pl-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {children}
                  </ol>
                );
              },

              li({ children, ...props }) {
                return (
                  <li className="my-0.5 leading-[1.7] text-slate-700 dark:text-slate-300" {...props}>
                    {children}
                  </li>
                );
              },

              // High-Contrast Bold Text
              strong({ children }) {
                return <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>;
              },

              // Custom Callouts / Alerts for Blockquotes
              blockquote({ children }) {
                const rawText = React.Children.toArray(children)
                  .map((child: any) => {
                    if (typeof child === 'string') return child;
                    if (child?.props?.children) {
                      return Array.isArray(child.props.children)
                        ? child.props.children.map((c: any) => (typeof c === 'string' ? c : c?.props?.children || '')).join('')
                        : String(child.props.children);
                    }
                    return '';
                  })
                  .join('');

                const cleanedChildren = cleanAlertChildren(children);

                if (rawText.includes('[!NOTE]')) {
                  return (
                    <div className="my-3 p-3.5 rounded-xl bg-sky-50 dark:bg-cyan-950/40 border border-sky-200 dark:border-cyan-500/30 border-l-4 border-l-sky-500 dark:border-l-cyan-400 text-sky-900 dark:text-cyan-200 flex items-start space-x-2.5 text-xs sm:text-sm shadow-sm">
                      <Info className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{cleanedChildren}</div>
                    </div>
                  );
                }

                if (rawText.includes('[!TIP]')) {
                  return (
                    <div className="my-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 border-l-4 border-l-emerald-500 dark:border-l-emerald-400 text-emerald-900 dark:text-emerald-200 flex items-start space-x-2.5 text-xs sm:text-sm shadow-sm">
                      <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{cleanedChildren}</div>
                    </div>
                  );
                }

                if (rawText.includes('[!WARNING]')) {
                  return (
                    <div className="my-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 border-l-4 border-l-amber-500 dark:border-l-amber-400 text-amber-900 dark:text-amber-200 flex items-start space-x-2.5 text-xs sm:text-sm shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{cleanedChildren}</div>
                    </div>
                  );
                }

                if (rawText.includes('[!IMPORTANT]') || rawText.includes('[!CAUTION]')) {
                  return (
                    <div className="my-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 border-l-4 border-l-rose-500 dark:border-l-rose-400 text-rose-900 dark:text-rose-200 flex items-start space-x-2.5 text-xs sm:text-sm shadow-sm">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{cleanedChildren}</div>
                    </div>
                  );
                }

                return (
                  <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-500 text-slate-700 dark:text-slate-300 flex items-start space-x-2.5 text-xs sm:text-sm italic">
                    <Quote className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div className="[&>p]:m-0 [&>p]:leading-relaxed flex-1">{children}</div>
                  </div>
                );
              },

              // Responsive Tables
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                      {children}
                    </table>
                  </div>
                );
              },

              thead({ children }) {
                return <thead className="bg-slate-50 dark:bg-slate-900/80">{children}</thead>;
              },

              th({ children }) {
                return (
                  <th className="px-3 py-2.5 text-left text-[0.7em] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {children}
                  </th>
                );
              },

              td({ children }) {
                return (
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60">
                    {children}
                  </td>
                );
              },

              // Syntax Code Blocks & Inline Chips
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
                  <div className="notes-code-wrapper relative group my-4 rounded-xl overflow-hidden border-2 border-slate-700/80 dark:border-slate-800 bg-[#0A0F1D] shadow-lg">
                    <div className="notes-code-header flex items-center justify-between px-3.5 sm:px-4 py-2 bg-[#131B2E] border-b border-slate-800 text-[11px] sm:text-xs font-mono text-slate-300">
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
                    <pre className="notes-code-pre p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-100 bg-[#0A0F1D] m-0 leading-relaxed scrollbar-thin">
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
