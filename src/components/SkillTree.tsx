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
  Lock,
  ArrowRight,
  Flame
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
    <div className="relative w-full max-w-5xl mx-auto py-8">
      
      {/* Visual Interconnecting SVG Line Path */}
      <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-1 hidden lg:block pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-cyan-500 via-blue-600 to-violet-600 opacity-30 rounded-full" />
      </div>

      <div className="space-y-12 relative z-10">
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

          // Alternate left and right positioning for skill tree nodes
          const isEven = index % 2 === 0;

          return (
            <div
              key={mod.id}
              className={`flex flex-col lg:flex-row items-center ${
                isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-6 lg:gap-12 transition-all duration-300 ${
                !isHighlighted ? 'opacity-40 grayscale-[50%]' : 'opacity-100'
              }`}
            >
              {/* Module Skill Card */}
              <div className="w-full lg:w-1/2">
                <Link
                  href={`/curriculum/${mod.slug}`}
                  className={`group relative block p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 shadow-lg shadow-emerald-500/10'
                      : isInProgress
                      ? 'bg-cyan-950/30 border-cyan-500/50 hover:border-cyan-400 shadow-xl shadow-cyan-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  
                  {/* Glowing Accent Corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-tr-2xl pointer-events-none" />

                  <div className="flex items-start justify-between">
                    
                    {/* Module Icon Badge */}
                    <div className={`w-14 h-14 rounded-2xl p-[2px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                      isCompleted
                        ? 'bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 shadow-lg shadow-cyan-500/20'
                    }`}>
                      <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                        <Icon className={`w-7 h-7 ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`} />
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold font-mono tracking-wider ${
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
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                        Module 0{mod.orderIndex}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mastered</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  {/* Progress Bar & Topic Count Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
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

                    <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800 transition-colors">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </Link>
              </div>

              {/* Node Center Marker (Desktop Only) */}
              <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-[#0B0F19] border-2 border-cyan-500 shadow-lg shadow-cyan-500/30 z-20 shrink-0">
                <span className="text-xs font-bold font-mono text-cyan-400">{mod.orderIndex}</span>
              </div>

              {/* Empty Spacer Column for layout symmetry */}
              <div className="hidden lg:block w-1/2" />

            </div>
          );
        })}
      </div>
    </div>
  );
};
