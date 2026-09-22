'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { getAllTopics } from '@/lib/curriculumService';
import { MODULES } from '@/data/seedModules';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const allTopics = getAllTopics();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTopics = query.trim() === ''
    ? allTopics.slice(0, 6)
    : allTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.moduleSlug.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 cursor-default"
      >
        {/* Search Input Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center h-12 pl-4 pr-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-[#0056D2] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-[#0056D2]/20 rounded-full shadow-2xs transition-all">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium pr-2"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-1.5 rounded-full"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0056D2] text-white shadow-xs shrink-0">
              <Search className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1 bg-white dark:bg-[#0D121F]">
          <div className="px-3 py-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {query.trim() === '' ? 'Suggested Topics' : `Search Results (${filteredTopics.length})`}
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              No topics found matching &quot;{query}&quot;. Try searching for &quot;Python&quot;, &quot;RAG&quot;, or &quot;Prompting&quot;.
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
              return (
                <Link
                  key={topic.id}
                  href={`/curriculum/${topic.moduleSlug}/${topic.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-sky-200 dark:hover:border-slate-700/50 transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-800/40 flex items-center justify-center text-sky-600 dark:text-cyan-400 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 text-sm transition-colors">
                        {topic.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                        {mod?.title} • {topic.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
          <span>
            <span className="hidden sm:inline">Navigate with ⬆⬇ and ENTER</span>
            <span className="sm:hidden">Tap topic to open</span>
          </span>
          <span>
            <span className="hidden sm:inline">ESC to close</span>
            <span className="sm:hidden">Tap ✕ to close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
