'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LEARNING_PATHS, MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { useWaynauticStore } from '@/lib/store';
import { SkillTree } from '@/components/SkillTree';
import { Compass, CheckCircle2, ArrowRight, Zap, Trophy, Award } from 'lucide-react';
import { CertificateModal } from '@/components/CertificateModal';

export default function PathsPage() {
  const { profile, progress, updateProfile } = useWaynauticStore();
  const [activePathSlug, setActivePathSlug] = useState<string>(profile.selectedPath || 'path-a');
  const [certModalOpen, setCertModalOpen] = useState(false);

  const selectedPathObj = LEARNING_PATHS.find(p => p.slug === activePathSlug) || LEARNING_PATHS[0];
  const pathModules = MODULES.filter(m => selectedPathObj.moduleSlugs.includes(m.slug));

  // Calculate completion percentage for active path
  const pathTopics = TOPICS.filter(t => selectedPathObj.moduleSlugs.includes(t.moduleSlug));
  const completedPathTopics = pathTopics.filter(t => progress[t.id]?.status === 'completed');
  const pathPercent = Math.round((completedPathTopics.length / Math.max(pathTopics.length, 1)) * 100);

  const handleSelectPath = (slug: string) => {
    setActivePathSlug(slug);
    updateProfile({ selectedPath: slug });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Certificate Modal Trigger */}
      <CertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        userName={profile.displayName || 'Developer'}
        pathTitle={selectedPathObj.title}
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-500/30 text-sky-700 dark:text-cyan-300 text-xs font-mono font-bold">
          <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
          <span>Curated Developer Paths</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
          Guided Learning Roadmaps
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Choose a structured track tailored to your experience level, or switch anytime.
        </p>
      </div>

      {/* Path Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Path A */}
        <div
          onClick={() => handleSelectPath('path-a')}
          className={`cursor-pointer p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 space-y-4 ${
            activePathSlug === 'path-a'
              ? 'bg-sky-50 dark:bg-gradient-to-br dark:from-cyan-950/50 dark:via-slate-900 dark:to-slate-900 border-sky-400 dark:border-cyan-500/60 shadow-xl dark:shadow-cyan-500/15 ring-2 ring-sky-300 dark:ring-cyan-500/30'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold ${
              activePathSlug === 'path-a'
                ? 'bg-sky-500 text-white dark:bg-cyan-500/10 dark:text-cyan-400 border border-sky-400 dark:border-cyan-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              A
            </span>
            {activePathSlug === 'path-a' && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-sky-500 text-white dark:bg-cyan-500 dark:text-black">
                Active Path
              </span>
            )}
          </div>
          <h2 className={`text-2xl font-extrabold ${activePathSlug === 'path-a' ? 'text-sky-950 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
            New to AI Development
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Foundational sequence covering Python, Git, LLM principles, Prompt Engineering, Model APIs, and AI-powered IDEs.
          </p>
          <div className="text-xs font-mono text-sky-600 dark:text-cyan-400 font-bold pt-2">
            6 Modules • 35 Lesson Units
          </div>
        </div>

        {/* Path B */}
        <div
          onClick={() => handleSelectPath('path-b')}
          className={`cursor-pointer p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 space-y-4 ${
            activePathSlug === 'path-b'
              ? 'bg-purple-50 dark:bg-gradient-to-br dark:from-violet-950/50 dark:via-slate-900 dark:to-slate-900 border-purple-400 dark:border-violet-500/60 shadow-xl dark:shadow-violet-500/15 ring-2 ring-purple-300 dark:ring-violet-500/30'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold ${
              activePathSlug === 'path-b'
                ? 'bg-purple-500 text-white dark:bg-violet-500/10 dark:text-violet-400 border border-purple-400 dark:border-violet-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              B
            </span>
            {activePathSlug === 'path-b' && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold font-mono bg-purple-500 text-white dark:bg-violet-500 dark:text-white">
                Active Path
              </span>
            )}
          </div>
          <h2 className={`text-2xl font-extrabold ${activePathSlug === 'path-b' ? 'text-purple-950 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
            Building Production AI Systems
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Advanced track focused on local runtimes, MCP protocol, high-scale Vector Databases, and complex RAG pipelines.
          </p>
          <div className="text-xs font-mono text-purple-600 dark:text-violet-400 font-bold pt-2">
            4 Modules • 21 Lesson Units
          </div>
        </div>

      </div>

      {/* Path Completion Meter & Certificate CTA */}
      <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="text-xs font-mono uppercase text-sky-600 dark:text-cyan-400 font-bold">Roadmap Completion</div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedPathObj.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{completedPathTopics.length} of {pathTopics.length} Topics Mastered ({pathPercent}%)</div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCertModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2"
          >
            <Award className="w-4 h-4 fill-black" />
            <span>Download Certificate</span>
          </button>
        </div>
      </div>

      {/* Visual Skill Tree for Selected Path */}
      <div className="space-y-4">
        <h3 className="text-center text-xl font-extrabold text-slate-900 dark:text-white">
          Visual Roadmap Node Sequence for &quot;{selectedPathObj.title}&quot;
        </h3>
        <SkillTree modules={pathModules} userProgress={progress} />
      </div>

    </div>
  );
}
