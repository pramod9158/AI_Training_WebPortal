'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  Terminal,
  Brain,
  Code2,
  Server,
  Layers,
  Database
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { useWaynauticStore } from '@/lib/store';
import { OnboardingTour } from '@/components/OnboardingTour';

export default function HomePage() {
  const router = useRouter();
  const { progress, streak } = useWaynauticStore();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Find last active/in-progress topic or default to topic 1
  const completedTopicIds = Object.keys(progress).filter(id => progress[id]?.status === 'completed');
  const lastTopicId = completedTopicIds.length > 0 ? completedTopicIds[completedTopicIds.length - 1] : 't-1';
  const continueTopic = TOPICS.find(t => t.id === lastTopicId) || TOPICS[0];

  return (
    <div className="relative overflow-hidden min-h-screen">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Onboarding Tour Overlay */}
      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-wide shadow-sm shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Master AI Engineering & Development Skills</span>
            <span className="bg-cyan-500 text-black px-1.5 py-0.2 text-[10px] font-bold rounded font-sans">56 Topics</span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Build the Future with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
              AI & Dev Skills
            </span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The high-engagement interactive academy for developers. Learn Large Language Models, Prompt Engineering, Model APIs, Local Runtimes, Vector Databases, and Agentic RAG.
          </p>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <button
              onClick={() => setOnboardingOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-bold text-base hover:brightness-110 shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
            >
              <Zap className="w-5 h-5 text-cyan-300 fill-cyan-300 group-hover:scale-110 transition-transform" />
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/curriculum"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 font-bold text-base transition-all flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5 text-slate-400" />
              <span>Browse All 10 Modules</span>
            </Link>

          </div>
        </div>

        {/* "Continue Learning" Quick Action Banner (If Student Active) */}
        {continueTopic && (
          <div className="mt-12 max-w-3xl mx-auto">
            <Link
              href={`/curriculum/${continueTopic.moduleSlug}/${continueTopic.slug}`}
              className="group block p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400/60 shadow-xl shadow-cyan-500/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Play className="w-6 h-6 fill-cyan-400 ml-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono uppercase text-cyan-400 font-semibold">Continue Learning</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <div className="font-bold text-white group-hover:text-cyan-300 text-base sm:text-lg">
                      {continueTopic.title}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Resume Lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        )}

      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 bg-slate-950/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Play className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Video & Interactive Notes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                1:1 dedicated HD video lessons paired with comprehensive markdown notes and copyable code snippets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-800/50 flex items-center justify-center text-violet-400">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Instant Quiz Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4-6 MCQs per topic unit with real-time scoring, explanations, attempt history, and celebratory completion bursts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Verifiable Certificates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete learning paths to auto-generate downloadable PDF credentials showcasing your AI engineering expertise.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Structured Curriculum</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">10 Core Modules</h2>
          </div>
          <Link
            href="/curriculum"
            className="inline-flex items-center space-x-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
          >
            <span>Explore Visual Skill Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => {
            const modTopics = TOPICS.filter((t) => t.moduleSlug === mod.slug);
            return (
              <Link
                key={mod.id}
                href={`/curriculum/${mod.slug}`}
                className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-cyan-400">Module 0{mod.orderIndex}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300">
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

    </div>
  );
}
