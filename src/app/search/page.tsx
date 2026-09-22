'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight, X } from 'lucide-react';
import { TOPICS } from '@/data/seedTopics';
import { MODULES } from '@/data/seedModules';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  const filteredTopics = query.trim() === ''
    ? TOPICS
    : TOPICS.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.moduleSlug.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      
      <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
        <h1 className="text-2xl xs:text-3xl font-extrabold text-slate-900 dark:text-white break-words">Search Academy Topics</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">Fuzzy search across all 56 lesson units, quizzes, and code notes.</p>
        
        <div className="relative pt-2 max-w-xl mx-auto">
          <div className="relative flex items-center h-13 sm:h-14 pl-5 pr-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus-within:border-[#0056D2] dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-[#0056D2]/15 rounded-full shadow-sm transition-all">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-base sm:text-lg font-medium pr-2"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2 rounded-full"
                aria-label="Clear query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0056D2] text-white shadow-xs shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
          Showing {filteredTopics.length} Topics
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredTopics.map((topic) => {
            const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
            return (
              <Link
                key={topic.id}
                href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=watch`}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-500/40 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-sky-600 dark:text-cyan-400 font-bold mb-1">
                    <span>{mod?.title}</span>
                    <span>{topic.estimatedMinutes}m</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 text-base transition-colors mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end text-xs text-sky-600 dark:text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Open Topic Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
