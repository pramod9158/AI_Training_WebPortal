'use client';

import React, { useRef } from 'react';
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
  ArrowRight,
  ChevronLeft,
  ChevronRight
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full py-6">
      
      {/* Scroll Left / Right Controls for Desktop */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Horizontal Skill Pathway ({modules.length} Modules)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-md"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800 transition-all shadow-md"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="relative">
        {/* Subtle Horizontal Gradient Line across top of nodes */}
        <div className="absolute top-[38px] left-8 right-8 h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 opacity-30 rounded-full pointer-events-none hidden md:block" />

        <div
          ref={scrollContainerRef}
          className="flex items-stretch overflow-x-auto gap-6 sm:gap-8 pb-8 pt-4 px-2 sm:px-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
                className={`snap-center shrink-0 w-[290px] sm:w-[340px] flex flex-col transition-all duration-300 ${
                  !isHighlighted ? 'opacity-40 grayscale-[50%]' : 'opacity-100'
                }`}
              >
                {/* Node Step Header Marker */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 shadow-md ${
                      isCompleted
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-emerald-500/20'
                        : isInProgress
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-400 shadow-cyan-500/20'
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-semibold">
                      Step 0{index + 1}
                    </span>
                  </div>

                  {index < modules.length - 1 && (
                    <div className="hidden sm:flex items-center text-slate-600 text-xs">
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  )}
                </div>

                {/* Module Skill Card */}
                <Link
                  href={`/curriculum/${mod.slug}`}
                  className={`group relative flex-1 flex flex-col justify-between p-5 sm:p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 shadow-lg shadow-emerald-500/10'
                      : isInProgress
                      ? 'bg-cyan-950/30 border-cyan-500/50 hover:border-cyan-400 shadow-xl shadow-cyan-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  {/* Glowing Accent Corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-tr-2xl pointer-events-none" />

                  <div>
                    <div className="flex items-start justify-between">
                      {/* Module Icon Badge */}
                      <div className={`w-12 h-12 rounded-xl p-[2px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                        isCompleted
                          ? 'bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20'
                          : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 shadow-lg shadow-cyan-500/20'
                      }`}>
                        <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`} />
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono tracking-wider ${
                        mod.difficulty === 'Beginner'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : mod.difficulty === 'Intermediate'
                          ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                          : 'bg-violet-950/80 text-violet-400 border border-violet-800/60'
                      }`}>
                        {mod.difficulty}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                          Module {index + 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>{completedCount} / {modTopics.length} Topics</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-cyan-500 to-violet-600'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
