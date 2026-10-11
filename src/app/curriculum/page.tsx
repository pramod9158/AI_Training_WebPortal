'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MODULES } from '@/data/seedModules';
import { getAllTopics, fetchCurriculumUpdates } from '@/lib/curriculumService';
import { SkillTree } from '@/components/SkillTree';
import { useWaynauticStore } from '@/lib/store';
import { BookOpen, Sparkles, Trophy, Zap } from 'lucide-react';

export default function CurriculumPage() {
  const { progress } = useWaynauticStore();
  const [topics, setTopics] = useState(getAllTopics());

  useEffect(() => {
    fetchCurriculumUpdates().then((updated) => setTopics(updated));

    const handleCurriculumChange = () => {
      setTopics(getAllTopics());
    };
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const totalTopicsCount = topics.length || 1;
  const completedTopicsCount = Object.values(progress).filter(p => p.status === 'completed').length;
  const overallPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* 3 Specialized Tracks Banner */}
      <div className="mb-10 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-violet-500/10 via-amber-500/10 to-cyan-500/10 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 block mb-1">
            ✨ 4-Week Cohorts &amp; 3-Month Industry Internships
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Explore Detailed Program Syllabi by Career Track:
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/curriculum/automation-testing"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shadow-sm hover:scale-105 transition-all"
          >
            Track 01: Automation Testing →
          </Link>
          <Link
            href="/curriculum/performance-testing"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shadow-sm hover:scale-105 transition-all"
          >
            Track 02: Performance Testing →
          </Link>
          <Link
            href="/curriculum/ai-training"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-sm hover:scale-105 transition-all"
          >
            Track 03: AI Training →
          </Link>
        </div>
      </div>

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
        <div className="pt-2 sm:pt-4 max-w-md mx-auto">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-mono">Overall Academy Completion</div>
                <div className="text-sm sm:text-base font-bold text-white leading-snug">{completedTopicsCount} of {totalTopicsCount} Topics Completed</div>
              </div>
            </div>
            <div className="self-end xs:self-auto text-right font-mono font-bold text-base sm:text-lg text-cyan-400 shrink-0">
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
