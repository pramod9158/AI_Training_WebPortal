'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, ArrowRight, CornerDownLeft, Sparkles, Clock } from 'lucide-react';
import { getAllTopics } from '@/lib/curriculumService';
import { MODULES } from '@/data/seedModules';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CHIPS = ['All', 'Python', 'Prompting', 'RAG', 'Vector DBs', 'LLMs', 'Local AI'];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const allTopics = getAllTopics();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedCategory('All');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter topics based on search query and category
  const filteredTopics = React.useMemo(() => {
    let list = allTopics;
    
    if (selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter((t) =>
        t.moduleSlug.toLowerCase().includes(catLower) ||
        t.title.toLowerCase().includes(catLower) ||
        t.description.toLowerCase().includes(catLower)
      );
    }

    if (query.trim() !== '') {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.moduleSlug.toLowerCase().includes(q)
      );
    }

    return query.trim() === '' && selectedCategory === 'All' ? list.slice(0, 8) : list;
  }, [allTopics, query, selectedCategory]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Esc, Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        return;
      }

      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }

      if (!isOpen || filteredTopics.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredTopics.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTopics.length) % filteredTopics.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredTopics[selectedIndex];
        if (selected) {
          onClose();
          router.push(`/curriculum/${selected.moduleSlug}/${selected.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredTopics, selectedIndex, router]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 cursor-default flex flex-col max-h-[85vh]"
      >
        {/* Modern Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D121F] gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0056D2] dark:text-cyan-400 shrink-0">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to learn? (e.g. Python, RAG, Prompting...)"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium border-none ring-0 shadow-none p-0"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Chips */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORY_CHIPS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#0056D2] text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div ref={resultsContainerRef} className="overflow-y-auto p-3 sm:p-4 space-y-2 pb-6 max-h-[56vh] flex-1 bg-white dark:bg-[#0D121F]">
          <div className="px-2 py-1 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>
              {query.trim() === '' && selectedCategory === 'All'
                ? 'Popular Topics'
                : `Found ${filteredTopics.length} topic${filteredTopics.length === 1 ? '' : 's'}`}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Use ↑↓ arrows to preview</span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
                No matching topics found for &quot;{query}&quot;
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                Try searching for Python basics, Prompt Engineering, Vector Databases, or RAG architecture.
              </p>
            </div>
          ) : (
            filteredTopics.map((topic, index) => {
              const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
              const isSelected = index === selectedIndex;
              return (
                <Link
                  key={topic.id}
                  href={`/curriculum/${topic.moduleSlug}/${topic.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(index)}
                  data-selected={isSelected}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-slate-800/90 border-blue-300 dark:border-cyan-800/80 shadow-xs'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#0056D2] text-white dark:bg-cyan-500 dark:text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-tight">
                          {mod?.title}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {topic.estimatedMinutes}m
                        </span>
                      </div>

                      <div
                        className={`font-bold text-sm truncate transition-colors ${
                          isSelected
                            ? 'text-[#0056D2] dark:text-cyan-300'
                            : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-300'
                        }`}
                      >
                        {topic.title}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium mt-0.5">
                        {topic.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-cyan-950 text-[#0056D2] dark:text-cyan-300 font-semibold">
                        ↵ Open
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform shrink-0 ${
                        isSelected
                          ? 'text-[#0056D2] dark:text-cyan-300 translate-x-1'
                          : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5'
                      }`}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono shadow-2xs">↓</kbd>
              <span className="hidden sm:inline ml-1 text-slate-400">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono shadow-2xs">↵</kbd>
              <span className="hidden sm:inline ml-1 text-slate-400">select</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono shadow-2xs">ESC</kbd>
            <span className="hidden sm:inline ml-1 text-slate-400">close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
