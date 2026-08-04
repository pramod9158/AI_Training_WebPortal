'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWaynauticStore } from '@/lib/store';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { 
  Flame, 
  Award, 
  Bookmark, 
  CheckCircle2, 
  Play, 
  Trophy, 
  Zap, 
  Sparkles, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, progress, streak, bookmarks, badges } = useWaynauticStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'badges'>('overview');

  const totalTopicsCount = TOPICS.length;
  const completedTopicIds = Object.keys(progress).filter(id => progress[id]?.status === 'completed');
  const completedTopicsCount = completedTopicIds.length;
  const overallPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  // Resume last active topic or default to topic 1
  const lastCompletedId = completedTopicIds[completedTopicIds.length - 1] || 't-1';
  const continueTopic = TOPICS.find(t => t.id === lastCompletedId) || TOPICS[0];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Student Workspace</span>
          <h1 className="text-3xl font-extrabold text-white">
            Welcome back, {profile.displayName || 'Developer'} 👋
          </h1>
        </div>

        {/* Action Button: Retake Tour */}
        <Link
          href="/onboarding"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-cyan-400 hover:border-cyan-500 transition-colors w-fit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Retake Guided Tour</span>
        </Link>
      </div>

      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Overall % */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Academy Progress</span>
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{overallPercent}%</div>
          <div className="text-xs text-slate-400">{completedTopicsCount} / {totalTopicsCount} Topics Mastered</div>
        </div>

        {/* Metric 2: Streak */}
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 uppercase">Daily Streak</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{streak.currentStreak} Days</div>
          <div className="text-xs text-slate-400">Longest Streak: {streak.longestStreak} Days</div>
        </div>

        {/* Metric 3: Earned Badges */}
        <div className="p-6 rounded-2xl bg-violet-950/20 border border-violet-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-violet-400 uppercase">Badges Unlocked</span>
            <Award className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-violet-400">{badges.length} Badges</div>
          <div className="text-xs text-slate-400">Module & Milestone Badges</div>
        </div>

        {/* Metric 4: Bookmarks */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Saved Lessons</span>
            <Bookmark className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{bookmarks.length} Topics</div>
          <div className="text-xs text-slate-400">Bookmarked for Revision</div>
        </div>

      </div>

      {/* "Continue Where You Left Off" Prominent Card */}
      {continueTopic && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border border-cyan-500/40 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 fill-cyan-400" />
              <span>Continue Where You Left Off</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Module 0{MODULES.find(m => m.slug === continueTopic.moduleSlug)?.orderIndex}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{continueTopic.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{continueTopic.description}</p>
            </div>
            <Link
              href={`/curriculum/${continueTopic.moduleSlug}/${continueTopic.slug}?tab=watch`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Resume Topic</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
            activeTab === 'overview'
              ? 'bg-cyan-500 text-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Module Breakdown
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-cyan-500 text-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bookmarks ({bookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase transition-all ${
            activeTab === 'badges'
              ? 'bg-cyan-500 text-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Badges ({badges.length})
        </button>
      </div>

      {/* Tab Panel 1: Per-Module Progress Bars */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => {
            const modTopics = TOPICS.filter(t => t.moduleSlug === mod.slug);
            const doneCount = modTopics.filter(t => progress[t.id]?.status === 'completed').length;
            const pct = Math.round((doneCount / modTopics.length) * 100);

            return (
              <div key={mod.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400">Module 0{mod.orderIndex}</span>
                  <span className="text-xs font-mono text-slate-400">{doneCount} / {modTopics.length} Done ({pct}%)</span>
                </div>
                <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-600 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/curriculum/${mod.slug}`}
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View Module</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Panel 2: Saved / Bookmarked Topics */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
              No saved topics yet! Click the star/bookmark icon on any topic page to save it for revision.
            </div>
          ) : (
            bookmarks.map(topicId => {
              const topic = TOPICS.find(t => t.id === topicId);
              if (!topic) return null;
              return (
                <div key={topicId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{topic.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{topic.description}</p>
                  </div>
                  <Link
                    href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=watch`}
                    className="px-4 py-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold hover:bg-cyan-900 transition-colors shrink-0"
                  >
                    Open Topic
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Panel 3: Earned Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {badges.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-400 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
              No badges unlocked yet. Complete topics and pass quizzes to earn achievement badges!
            </div>
          ) : (
            badges.map(b => (
              <div key={b.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">{b.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
                <div className="text-[10px] font-mono text-slate-500">Earned: {new Date(b.earnedAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
