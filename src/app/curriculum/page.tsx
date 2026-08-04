'use client';

import React from 'react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { SkillTree } from '@/components/SkillTree';
import { useWaynauticStore } from '@/lib/store';
import { BookOpen, Sparkles, Trophy, Zap } from 'lucide-react';

export default function CurriculumPage() {
  const { progress } = useWaynauticStore();

  const totalTopicsCount = TOPICS.length;
  const completedTopicsCount = Object.values(progress).filter(p => p.status === 'completed').length;
  const overallPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Skill Tree</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Curriculum & Module Map
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Navigate 10 structured modules and 56 developer topic units. Unlock nodes, complete quizzes, and master production AI workflows.
        </p>

        {/* Overall Completion Progress Ring Card */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-mono">Overall Academy Completion</div>
                <div className="text-base font-bold text-white">{completedTopicsCount} of {totalTopicsCount} Topics Completed</div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-lg text-cyan-400">
              {overallPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Skill Tree Component */}
      <SkillTree modules={MODULES} userProgress={progress} />

    </div>
  );
}
