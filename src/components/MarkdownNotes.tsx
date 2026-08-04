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
    <div className="w-full bg-[#0D121F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl text-slate-200">
      
      {/* Header Banner */}
      <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-800 text-xs font-mono text-cyan-400 uppercase tracking-wider">
        <BookOpen className="w-4 h-4 text-cyan-400" />
        <span>Topic Text Notes & Code Specifications</span>
      </div>

      {/* Markdown Body */}
      <article className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#070A12] prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const codeString = String(children).replace(/\n$/, '');
              if (inline) {
                return (
                  <code className="bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-800" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-800 bg-[#070A12]">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Code Snippet</span>
                    </span>
                    <button
                      onClick={() => handleCopy(codeString)}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm font-mono text-cyan-100 bg-[#070A12] m-0">
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
