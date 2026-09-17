'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Flame, 
  Compass, 
  Terminal,
  Brain,
  Code2,
  Server,
  Layers,
  Database
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { getAllTopics, getResumeTopic, getResumeLearningUrl } from '@/lib/curriculumService';
import { useWaynauticStore } from '@/lib/store';
import { OnboardingTour } from '@/components/OnboardingTour';

export default function HomePage() {
  const router = useRouter();
  const { profile, progress, streak } = useWaynauticStore();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [topics, setTopics] = useState(getAllTopics());
  const isLoggedIn = Boolean(profile.userId || profile.email);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('error=') || window.location.hash.includes('error_code='))) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const handleCurriculumChange = () => {
      setTopics(getAllTopics());
    };
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  // Unified Resume Topic logic matching Dashboard
  const continueTopic = useMemo(() => getResumeTopic(profile, progress), [profile, progress]);
  const resumeUrl = useMemo(() => getResumeLearningUrl(profile, progress), [profile, progress]);

  return (
    <div className="relative overflow-hidden min-h-screen">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Onboarding Tour Overlay */}
      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />



      {/* Hero Section */}
      <section className="relative pt-8 pb-16 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[11px] sm:text-xs font-mono tracking-wide shadow-sm shadow-cyan-500/10 max-w-full text-center flex-wrap justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[200px] xs:max-w-none">
              {profile.userId || profile.email 
                ? `Welcome, ${profile.displayName || 'Developer'}!` 
                : 'Master AI Engineering & Development Skills'}
            </span>
            <span className="bg-cyan-500 text-black px-1.5 py-0.2 text-[10px] font-bold rounded font-sans shrink-0">56 Topics</span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto space-y-5 sm:space-y-6">
          <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.1] break-words">
            Build the Future with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              AI & Dev Skills
            </span>
          </h1>
          <p className="text-sm sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-1 font-normal">
            The high-engagement interactive academy for developers. Learn Large Language Models, Prompt Engineering, Model APIs, Local Runtimes, Vector Databases, and Agentic RAG.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            
            <Link
              href={isLoggedIn ? "/curriculum" : "/login"}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-sm sm:text-base hover:brightness-110 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group min-h-[48px]"
            >
              <Zap className="w-5 h-5 text-cyan-300 fill-cyan-300 group-hover:scale-110 transition-transform shrink-0" />
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            <Link
              href="/curriculum"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <BookOpen className="w-5 h-5 text-slate-400 shrink-0" />
              <span>Browse All 10 Modules</span>
            </Link>

          </div>
        </div>

        {/* "Continue Learning" Quick Action Banner (If Student Active) */}
        {isLoggedIn && continueTopic && (
          <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
            <Link
              href={resumeUrl}
              className="group block p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/40 dark:to-slate-900 border-2 border-slate-200 dark:border-cyan-500/30 hover:border-sky-400 dark:hover:border-cyan-400/60 shadow-lg dark:shadow-cyan-500/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-100 dark:bg-cyan-500/10 border border-sky-300 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400 shrink-0">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-sky-600 dark:fill-cyan-400 ml-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] sm:text-[11px] font-mono uppercase text-sky-600 dark:text-cyan-400 font-bold">Continue Learning</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-cyan-400 animate-ping" />
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 text-sm sm:text-lg truncate">
                      {continueTopic.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-extrabold text-sky-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                  <span className="hidden xs:inline">Resume</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

      </section>


      {/* Modules Overview — logged-in users only */}
      {isLoggedIn && (
        <section className="py-12 sm:py-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 sm:mb-12 space-y-4 md:space-y-0">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Structured Curriculum</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">10 Core Modules</h2>
            </div>
            <Link
              href="/curriculum"
              className="inline-flex items-center space-x-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>Explore Visual Skill Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MODULES.map((mod) => {
              const modTopics = topics.filter((t) => t.moduleSlug === mod.slug);
              return (
                <Link
                  key={mod.id}
                  href={`/curriculum/${mod.slug}`}
                  className="group p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono text-cyan-400">Module {String(mod.orderIndex).padStart(2, '0')}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                        mod.difficulty === 'Beginner'
                          ? 'badge-diff-beginner'
                          : mod.difficulty === 'Intermediate'
                          ? 'badge-diff-intermediate'
                          : 'badge-diff-advanced'
                      }`}>
                        {mod.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>{modTopics.length} Lessons</span>
                    <div className="flex items-center space-x-1 text-cyan-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
