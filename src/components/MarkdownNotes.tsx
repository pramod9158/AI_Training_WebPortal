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
  FileCode 
} from 'lucide-react';

interface MarkdownNotesProps {
  content: string;
}

export const MarkdownNotes: React.FC<MarkdownNotesProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 shadow-xl text-slate-800 dark:text-slate-200 overflow-hidden">
      
      {/* Header Banner */}
      <div className="flex items-center space-x-2 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b-2 border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider">
        <BookOpen className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
        <span className="truncate">Topic Text Notes & Technical Specifications</span>
      </div>

      {/* Markdown Body */}
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

            // Syntax Code Blocks & Inline Chips
            code({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              const codeString = String(children).replace(/\n$/, '');
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !codeString.includes('\n');

              if (isInline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-900 text-sky-700 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-800 font-semibold before:content-none after:content-none" {...props}>
                    {children}
                  </code>
                );
              }

              const languageLabel = match ? match[1] : 'code';

              return (
                <div className="relative group my-4 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-[#070A12] shadow-md">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] sm:text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold uppercase tracking-wider text-cyan-400">{languageLabel}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(codeString)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy code snippet"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-100 bg-[#070A12] m-0 leading-relaxed scrollbar-thin">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

    </div>
  );
};
