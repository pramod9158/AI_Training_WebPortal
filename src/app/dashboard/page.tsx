'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Trophy, 
  Flame, 
  Award, 
  Bookmark, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap,
  Trash2,
  BookOpen
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';
import { useWaynauticStore } from '@/lib/store';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { profile, progress, streak, bookmarks, badges, toggleBookmarkTopic } = useWaynauticStore();
  const isLoggedIn = Boolean(profile.userId || profile.email);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookmarks' | 'badges'>(() => {
    if (tabParam === 'bookmarks' || tabParam === 'badges' || tabParam === 'overview') {
      return tabParam;
    }
    return 'overview';
  });

  useEffect(() => {
    if (tabParam === 'bookmarks' || tabParam === 'badges' || tabParam === 'overview') {
      setActiveTab(tabParam);
      if (tabParam === 'bookmarks') {
        setTimeout(() => {
          const el = document.getElementById('dashboard-tabs');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [tabParam]);

  const totalTopicsCount = TOPICS.length;
  const completedTopicsCount = Object.keys(progress).filter(
    (k) => progress[k]?.status === 'completed'
  ).length;
  const overallPercent = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  // Find last active/in-progress topic or default to topic 1
  const completedTopicIds = Object.keys(progress).filter(id => progress[id]?.status === 'completed');
  const lastTopicId = profile.lastAccessedTopicId || (completedTopicIds.length > 0 ? completedTopicIds[completedTopicIds.length - 1] : 't-1');
  const continueTopic = TOPICS.find(t => t.id === lastTopicId || t.slug === lastTopicId) || TOPICS[0];

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
            {isLoggedIn ? 'Student Dashboard' : 'Guest Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white pt-1">
            {isLoggedIn ? `Welcome back, ${profile.displayName || 'Developer'} 👋` : 'Welcome, Guest 👋'}
          </h1>
        </div>

        {/* Action Button: Retake Tour */}
        <Link
          href="/onboarding"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/80 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 hover:border-sky-400 dark:hover:border-cyan-500 transition-colors w-fit shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Retake Guided Tour</span>
        </Link>
      </div>

      {/* Guest Mode Banner if not logged in */}
      {!isLoggedIn && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-cyan-950/40 dark:to-indigo-950/30 border-2 border-sky-200 dark:border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-700 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Browsing in Guest Mode</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Log in or create a free account to save your learning progress permanently, track streaks, and earn verified credentials.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/login?redirectTo=/dashboard"
              className="px-4 py-2 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border border-[#58A700] text-white text-xs font-extrabold shadow-sm transition-all"
            >
              Log In
            </Link>
            <Link
              href="/signup?redirectTo=/dashboard"
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold hover:border-sky-400 transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Banner Grid (2x2 on mobile, 4x1 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Metric 1: Overall % */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 space-y-1 sm:space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold truncate">Progress</span>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-cyan-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{overallPercent}%</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{completedTopicsCount} / {totalTopicsCount} Mastered</div>
        </div>

        {/* Metric 2: Streak */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-500/30 space-y-1 sm:space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-amber-700 dark:text-amber-400 uppercase font-bold truncate">Streak</span>
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{streak.currentStreak} Days</div>
          <div className="text-[10px] sm:text-xs text-amber-700/80 dark:text-slate-400 font-medium truncate">Best: {streak.longestStreak} Days</div>
        </div>

        {/* Metric 3: Earned Badges */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-purple-50 dark:bg-violet-950/20 border-2 border-purple-300 dark:border-violet-500/30 space-y-1 sm:space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-purple-700 dark:text-violet-400 uppercase font-bold truncate">Badges</span>
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-violet-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-violet-400">{badges.length} Badges</div>
          <div className="text-[10px] sm:text-xs text-purple-700/80 dark:text-slate-400 font-medium truncate">Milestones Unlocked</div>
        </div>

        {/* Metric 4: Bookmarks */}
        <button
          onClick={() => setActiveTab('bookmarks')}
          className="text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 space-y-1 sm:space-y-2 shadow-sm hover:border-sky-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold truncate">Saved</span>
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-cyan-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{bookmarks.length} Topics</div>
          <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Click to View List →</div>
        </button>

      </div>

      {/* "Continue Where You Left Off" Prominent Card */}
      {continueTopic && (
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/50 dark:to-slate-900 border-2 border-slate-200 dark:border-cyan-500/40 shadow-xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 fill-sky-600 dark:fill-cyan-400" />
              <span>Continue Where You Left Off</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">Module 0{MODULES.find(m => m.slug === continueTopic.moduleSlug)?.orderIndex}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">{continueTopic.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-2">{continueTopic.description}</p>
            </div>
            <Link
              href={`/curriculum/${continueTopic.moduleSlug}/${continueTopic.slug}?tab=watch`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Topic</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div id="dashboard-tabs" className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b-2 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Module Breakdown
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 ${
            activeTab === 'bookmarks'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Saved Topics ({bookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 ${
            activeTab === 'badges'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Badges ({badges.length})
        </button>
      </div>

      {/* Tab Panel 1: Per-Module Progress Bars */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {MODULES.map((mod) => {
            const modTopics = TOPICS.filter(t => t.moduleSlug === mod.slug);
            const doneCount = modTopics.filter(t => progress[t.id]?.status === 'completed').length;
            const pct = Math.round((doneCount / modTopics.length) * 100);

            return (
              <div key={mod.id} className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-cyan-400">Module 0{mod.orderIndex}</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">{doneCount} / {modTopics.length} Done ({pct}%)</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">{mod.title}</h3>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="pt-1 flex justify-end">
                  <Link
                    href={`/curriculum/${mod.slug}`}
                    className="text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <span>View Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="p-8 sm:p-14 text-center bg-white dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 dark:bg-cyan-950/60 border-2 border-sky-200 dark:border-cyan-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  No Saved Topics Yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                  You haven&apos;t bookmarked any lessons yet. Click the bookmark (🔖) icon while studying any lesson or quiz to save it here for fast revision!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/curriculum"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                  <span>Browse Curriculum Syllabus</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {bookmarks.map((topicId) => {
                const topic = TOPICS.find((t) => t.id === topicId || t.slug === topicId);
                if (!topic) return null;
                const mod = MODULES.find((m) => m.slug === topic.moduleSlug);
                const isCompleted = progress[topic.id]?.status === 'completed';

                return (
                  <div
                    key={topicId}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-sky-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/60 border border-sky-200 dark:border-cyan-800 px-2 py-0.5 rounded-md">
                          Module 0{mod?.orderIndex || 1}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">
                        {topic.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        onClick={() => toggleBookmarkTopic(topic.id)}
                        className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove from saved topics"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=watch`}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs transition-all text-center flex items-center justify-center space-x-1.5 min-h-[42px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Open Lesson</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel 3: Earned Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {badges.length === 0 ? (
            <div className="col-span-full p-8 sm:p-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900/40 rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-800 font-medium">
              No badges unlocked yet. Complete topics and pass quizzes to earn achievement badges!
            </div>
          ) : (
            badges.map(b => (
              <div key={b.id} className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-cyan-950 border border-purple-300 dark:border-cyan-800 flex items-center justify-center text-purple-600 dark:text-cyan-400">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{b.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{b.description}</p>
                <div className="text-[10px] font-mono text-slate-500">Earned: {new Date(b.earnedAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-sm font-bold text-slate-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
