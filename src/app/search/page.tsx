'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white">Search Academy Topics</h1>
        <p className="text-xs sm:text-sm text-slate-300">Fuzzy search across all 56 lesson units, quizzes, and code notes.</p>
        
        <div className="relative pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-6" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics (e.g. Python, Vector DBs, Prompt Injection)..."
            className="w-full py-4 pl-12 pr-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-base"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-500 uppercase">
          Showing {filteredTopics.length} Topics
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTopics.map((topic) => {
            const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
            return (
              <Link
                key={topic.id}
                href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=watch`}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1">
                    <span>{mod?.title}</span>
                    <span>{topic.estimatedMinutes}m</span>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-cyan-300 text-base transition-colors mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end text-xs text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
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
