'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Sparkles, 
  Cpu, 
  Code2, 
  Server, 
  Terminal, 
  GitBranch, 
  Layers, 
  Database, 
  Workflow,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Module } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { UserProgress } from '@/lib/types';

interface SkillTreeProps {
  modules: Module[];
  userProgress: Record<string, UserProgress>;
  highlightSlugs?: string[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Sparkles,
  Cpu,
  Code2,
  Server,
  Terminal,
  GitBranch,
  Layers,
  Database,
  Workflow
};

export const SkillTree: React.FC<SkillTreeProps> = ({
  modules,
  userProgress,
  highlightSlugs
}) => {
  return (
    <div className="w-full py-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6 px-1">
        <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
          Curriculum Learning Pathway ({modules.length} Modules)
        </span>
      </div>

      {/* 3-Column Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {modules.map((mod, index) => {
          const Icon = ICON_MAP[mod.iconName] || Brain;
          const modTopics = TOPICS.filter((t) => t.moduleSlug === mod.slug);
          const completedCount = modTopics.filter(
            (t) => userProgress[t.id]?.status === 'completed'
          ).length;
          const progressPercent = Math.round(
            (completedCount / Math.max(modTopics.length, 1)) * 100
          );

          const isHighlighted = !highlightSlugs || highlightSlugs.includes(mod.slug);
          const isCompleted = progressPercent === 100;
          const isInProgress = progressPercent > 0 && progressPercent < 100;

          return (
            <div
              key={mod.id}
              className={`flex flex-col transition-all duration-300 ${
                !isHighlighted ? 'opacity-40 grayscale-[50%]' : 'opacity-100'
              }`}
            >
              {/* Module Card Header Step Marker */}
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
                      : isInProgress
                      ? 'bg-sky-50 dark:bg-cyan-950 border-sky-500 dark:border-cyan-400 text-sky-700 dark:text-cyan-400'
                      : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400 font-semibold">
                    Step 0{index + 1}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono tracking-wider ${
                  mod.difficulty === 'Beginner'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                    : mod.difficulty === 'Intermediate'
                    ? 'bg-sky-50 dark:bg-cyan-950/80 text-sky-700 dark:text-cyan-400 border border-sky-300 dark:border-cyan-800/60'
                    : 'bg-purple-50 dark:bg-violet-950/80 text-purple-700 dark:text-violet-400 border border-purple-300 dark:border-violet-800/60'
                }`}>
                  {mod.difficulty}
                </span>
              </div>

              {/* Module Card */}
              <Link
                href={`/curriculum/${mod.slug}`}
                className={`group relative flex-1 flex flex-col justify-between p-6 rounded-3xl border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-white dark:bg-slate-900/80 border-emerald-400/80 dark:border-emerald-500/40 hover:border-emerald-500 shadow-md'
                    : isInProgress
                    ? 'bg-white dark:bg-slate-900/80 border-sky-400 dark:border-cyan-500/60 shadow-lg shadow-sky-500/10 ring-2 ring-sky-300/40 dark:ring-cyan-500/20'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Glowing Accent Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-tr-3xl pointer-events-none" />

                <div>
                  {/* Module Icon Badge */}
                  <div className={`w-12 h-12 rounded-xl p-[2px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                    isCompleted
                      ? 'bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20'
                      : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 shadow-lg shadow-cyan-500/20'
                  }`}>
                    <div className="w-full h-full bg-slate-50 dark:bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-sky-600 dark:text-cyan-400'}`} />
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-sky-600 dark:text-cyan-400 uppercase tracking-widest font-semibold">
                        Module {index + 1}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1 font-medium">
                      <span>{completedCount} / {modTopics.length} Topics</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 dark:from-cyan-500 dark:to-violet-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-sky-500 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-black transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
