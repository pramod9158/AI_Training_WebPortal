'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Clock, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Topic, MODULES } from '@/data/seedModules';
import { getRecommendedTopics } from '@/lib/curriculumService';
import { useWaynauticStore } from '@/lib/store';

interface RecommendedTopicsProps {
  currentTopic: Topic;
}

export function RecommendedTopics({ currentTopic }: RecommendedTopicsProps) {
  const { progress } = useWaynauticStore();
  const recommendations = getRecommendedTopics(currentTopic, undefined, 3);

  if (recommendations.length === 0) return null;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-500 dark:text-cyan-400" />
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            You Might Also Like
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Handpicked related units
        </span>
      </div>

      {/* Recommended Topics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {recommendations.map((topic) => {
          const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
          const isDone = progress[topic.id]?.status === 'completed';

          return (
            <Link
              key={topic.id}
              href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=watch`}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400 uppercase tracking-wider bg-sky-50 dark:bg-cyan-950/60 border border-sky-200 dark:border-cyan-800 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                    Module 0{mod?.orderIndex || 1} • {mod?.title}
                  </span>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>

                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {topic.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 font-medium">
                  {topic.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{topic.estimatedMinutes}m</span>
                </span>
                <span className="text-sky-600 dark:text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
