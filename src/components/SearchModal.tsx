'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { TOPICS } from '@/data/seedTopics';
import { MODULES } from '@/data/seedModules';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

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
    ? TOPICS.slice(0, 6)
    : TOPICS.filter(
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
        <div className="flex items-center px-4 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 56 topics, modules, or skills..."
            className="w-full py-4 px-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base font-semibold border-none ring-0 shadow-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t-2 border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono font-medium">
          <span>Navigate with ⬆⬇ and ENTER</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
