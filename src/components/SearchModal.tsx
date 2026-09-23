'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, ArrowRight, TrendingUp } from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { getAllTopics } from '@/lib/curriculumService';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ref to the search trigger button so the dropdown can align with it */
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}

const TRENDING_TAGS = [
  'Artificial Intelligence',
  'Python',
  'Prompt Engineering',
  'RAG',
  'LLMs',
  'Vector DBs',
  'Local AI',
  'Machine Learning',
  'OpenAI',
  'Claude',
  'Gemini',
  'Fine-tuning',
];

export const SearchModal: React.FC<SearchDropdownProps> = ({ isOpen, onClose, anchorRef }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allTopics = getAllTopics();

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter topics based on search query
  const filteredTopics = React.useMemo(() => {
    if (query.trim() === '') return [];
    const q = query.toLowerCase();
    return allTopics
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.moduleSlug.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allTopics, query]);

  // Popular topics shown when no query
  const popularTopics = React.useMemo(() => allTopics.slice(0, 5), [allTopics]);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard: ArrowUp, ArrowDown, Enter, Esc, Cmd+K
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

      const list = query.trim() ? filteredTopics : popularTopics;
      if (!isOpen || list.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % list.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + list.length) % list.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = list[selectedIndex];
        if (selected) {
          onClose();
          router.push(`/curriculum/${selected.moduleSlug}/${selected.slug}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredTopics, popularTopics, selectedIndex, query, router]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const displayList = query.trim() ? filteredTopics : popularTopics;

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dropdownRef}
        className="fixed inset-x-3 top-[68px] sm:absolute sm:top-full sm:mt-2 sm:left-0 sm:right-0 sm:w-full sm:inset-x-auto z-[9999] bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[82vh] flex flex-col"
      >
        {/* Search Input inside dropdown */}
        <div className="flex items-center px-4 py-3 gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to learn?"
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium border-none ring-0 p-0"
            aria-label="Search topics"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content container */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Trending Tags — shown when no query */}
          {!query.trim() && (
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Trending on Waynautic
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-cyan-700 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results or popular topics */}
          <div className="px-3 pt-2 pb-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {query.trim()
                  ? filteredTopics.length === 0
                    ? 'No results'
                    : `${filteredTopics.length} topic${filteredTopics.length === 1 ? '' : 's'} found`
                  : 'Popular Topics'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                Use ↑↓ to navigate · ↵ to open
              </span>
            </div>

            {/* Empty state */}
            {query.trim() && filteredTopics.length === 0 && (
              <div className="py-6 text-center">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No topics found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Try: Python, RAG, Prompting, or LLMs
                </p>
              </div>
            )}

            {/* Topic rows */}
            <div className="space-y-0.5">
              {displayList.map((topic, index) => {
                const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
                const isSelected = index === selectedIndex;
                return (
                  <Link
                    key={topic.id}
                    href={`/curriculum/${topic.moduleSlug}/${topic.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(index)}
                    data-selected={isSelected}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-slate-800/90'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#0056D2] text-white dark:bg-cyan-500 dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-tight truncate">
                            {mod?.title}
                          </span>
                        </div>
                        <div
                          className={`font-semibold text-sm truncate transition-colors ${
                            isSelected
                              ? 'text-[#0056D2] dark:text-cyan-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {topic.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {topic.description}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 ml-2 transition-all ${
                        isSelected
                          ? 'text-[#0056D2] dark:text-cyan-400 translate-x-0.5'
                          : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↓</kbd>
              <span className="hidden sm:inline">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">↵</kbd>
              <span className="hidden sm:inline">select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[9px]">ESC</kbd>
            <span className="hidden sm:inline">close</span>
          </span>
        </div>
      </div>
    </>
  );
};
