'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { useWaynauticStore } from '@/lib/store';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Play, 
  ArrowLeft, 
  ArrowRight,
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
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Brain, Sparkles, Cpu, Code2, Server, Terminal, GitBranch, Layers, Database, Workflow
};

export default function ModulePage() {
  const params = useParams();
  const moduleSlug = params?.moduleSlug as string;
  const { progress } = useWaynauticStore();

  const moduleData = MODULES.find((m) => m.slug === moduleSlug);
  if (!moduleData) {
    return notFound();
  }

  const Icon = ICON_MAP[moduleData.iconName] || Brain;
  const moduleTopics = TOPICS.filter((t) => t.moduleSlug === moduleSlug);
  const completedCount = moduleTopics.filter(
    (t) => progress[t.id]?.status === 'completed'
  ).length;
  const progressPercent = Math.round(
    (completedCount / Math.max(moduleTopics.length, 1)) * 100
  );

  // Find first uncompleted topic or default to first topic
  const firstUncompleted = moduleTopics.find(
    (t) => progress[t.id]?.status !== 'completed'
  ) || moduleTopics[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Back Link */}
      <Link
        href="/curriculum"
        className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Curriculum Skill Map</span>
      </Link>

      {/* Module Hero Banner */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Icon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Module 0{moduleData.orderIndex}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                  {moduleData.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                {moduleData.title}
              </h1>
            </div>
          </div>

          {/* Start Module CTA */}
          {firstUncompleted && (
            <Link
              href={`/curriculum/${moduleSlug}/${firstUncompleted.slug}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{completedCount > 0 ? 'Continue Module' : 'Start Module'}</span>
            </Link>
          )}
        </div>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {moduleData.description}
        </p>

        {/* Progress Bar */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Module Completion</span>
            <span>{completedCount} of {moduleTopics.length} Topics ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-violet-600 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Ordered Topic List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Topic Lessons ({moduleTopics.length})</span>
        </h2>

        <div className="space-y-3">
          {moduleTopics.map((topic, index) => {
            const isCompleted = progress[topic.id]?.status === 'completed';
            const score = progress[topic.id]?.score;

            return (
              <Link
                key={topic.id}
                href={`/curriculum/${moduleSlug}/${topic.slug}`}
                className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-emerald-500/30 hover:border-emerald-400/60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-cyan-300 text-base transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{topic.estimatedMinutes}m</span>
                  </div>

                  {score !== undefined && (
                    <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                      Quiz: {score}%
                    </span>
                  )}

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
