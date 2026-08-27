'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, BookOpen, Sparkles } from 'lucide-react';

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
        <span className="truncate">Topic Text Notes & Code Specifications</span>
      </div>

      {/* Markdown Body */}
      <article className="prose max-w-none text-slate-700 dark:text-slate-200 prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-extrabold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base sm:prose-h3:text-lg prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs sm:prose-p:text-sm prose-a:text-sky-600 dark:prose-a:text-cyan-400 hover:prose-a:underline prose-code:text-sky-700 dark:prose-code:text-cyan-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-200 dark:prose-code:border-slate-800 prose-code:before:content-none prose-code:after:content-none prose-ul:text-xs sm:prose-ul:text-sm prose-ol:text-xs sm:prose-ol:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table({ children }) {
              return (
                <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
                    {children}
                  </table>
                </div>
              );
            },
            code({ inline, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              const codeString = String(children).replace(/\n$/, '');
              if (inline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-900 text-sky-700 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-800 font-semibold" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="relative group my-4 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-[#070A12] shadow-md">
                  <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] sm:text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">Code Specification</span>
                    </span>
                    <button
                      onClick={() => handleCopy(codeString)}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy code snippet"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied</span>
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
