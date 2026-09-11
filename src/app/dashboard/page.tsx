'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  BookOpen,
  Search,
  Crown,
  Lock,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { MODULES } from '@/data/seedModules';
import { useWaynauticStore } from '@/lib/store';
import { getResumeLearningUrl, getAllTopics, fetchCurriculumUpdates } from '@/lib/curriculumService';
import { StreakTracker } from '@/components/StreakTracker';
import { 
  computeOverallStats, 
  computeModuleProgressStats, 
  getFullBadgeCatalog 
} from '@/lib/progressAnalytics';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { profile, progress, streak, bookmarks, badges, toggleBookmarkTopic } = useWaynauticStore();
  const isLoggedIn = Boolean(profile.userId || profile.email);

  type TabType = 'overview' | 'quizzes' | 'badges' | 'bookmarks';
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabParam === 'bookmarks' || tabParam === 'badges' || tabParam === 'overview' || tabParam === 'quizzes') {
      return tabParam as TabType;
    }
    return 'overview';
  });

  const [topics, setTopics] = useState(getAllTopics());

  useEffect(() => {
    fetchCurriculumUpdates().then((updated) => setTopics(updated));
    const handleCurriculumChange = () => setTopics(getAllTopics());
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  // Filters for sub-views
  const [moduleFilter, setModuleFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');
  const [quizSearch, setQuizSearch] = useState('');
  const [quizFilter, setQuizFilter] = useState<'all' | 'mastered' | 'passed' | 'needs_practice' | 'unattempted'>('all');
  const [badgeCategory, setBadgeCategory] = useState<'all' | 'Milestones' | 'Quizzes' | 'Modules' | 'Streaks'>('all');
  const [badgeUnlockedOnly, setBadgeUnlockedOnly] = useState(false);

  useEffect(() => {
    if (tabParam === 'bookmarks' || tabParam === 'badges' || tabParam === 'overview' || tabParam === 'quizzes') {
      setActiveTab(tabParam as TabType);
      if (tabParam === 'bookmarks' || tabParam === 'quizzes' || tabParam === 'badges') {
        setTimeout(() => {
          const el = document.getElementById('dashboard-tabs');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [tabParam]);

  // Analytics
  const overallStats = useMemo(() => computeOverallStats(progress, topics), [progress, topics]);
  const moduleStats = useMemo(() => computeModuleProgressStats(progress, topics), [progress, topics]);
  const badgeCatalog = useMemo(() => getFullBadgeCatalog(badges, progress, streak), [badges, progress, streak]);

  // Find last active/in-progress topic or default to topic 1
  const completedTopicIds = Object.keys(progress).filter(id => progress[id]?.status === 'completed');
  const isBrandNewStudent = overallStats.completedTopics === 0 && !profile.lastAccessedTopicId;
  const lastTopicId = profile.lastAccessedTopicId || (completedTopicIds.length > 0 ? completedTopicIds[completedTopicIds.length - 1] : 't-1');
  const continueTopic = topics.find(t => t.id === lastTopicId || t.slug === lastTopicId) || topics[0];
  const continueModule = MODULES.find(m => m.slug === continueTopic?.moduleSlug) || MODULES[0];

  // Filtered Modules
  const filteredModules = useMemo(() => {
    if (moduleFilter === 'all') return moduleStats;
    return moduleStats.filter(m => m.status === moduleFilter);
  }, [moduleStats, moduleFilter]);

  // Filtered Quizzes
  const quizList = useMemo(() => {
    return topics.map(topic => {
      const mod = MODULES.find(m => m.slug === topic.moduleSlug);
      const prog = progress[topic.id];
      const score = prog?.score;
      const hasAttempted = typeof score === 'number' && !isNaN(score);
      const isMastered = hasAttempted && score >= 90;
      const isPassed = hasAttempted && score >= 70 && score < 90;
      const isNeedsPractice = hasAttempted && score < 70;

      return {
        topic,
        module: mod,
        score,
        hasAttempted,
        isMastered,
        isPassed,
        isNeedsPractice,
        completedAt: prog?.completedAt,
        status: prog?.status || 'not_started'
      };
    });
  }, [progress, topics]);

  const filteredQuizzes = useMemo(() => {
    return quizList.filter(item => {
      // Search
      const matchSearch = quizSearch.trim() === '' || 
        item.topic.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
        item.module?.title.toLowerCase().includes(quizSearch.toLowerCase());

      if (!matchSearch) return false;

      // Filter
      if (quizFilter === 'mastered') return item.isMastered;
      if (quizFilter === 'passed') return item.isPassed;
      if (quizFilter === 'needs_practice') return item.isNeedsPractice;
      if (quizFilter === 'unattempted') return !item.hasAttempted;
      return true;
    });
  }, [quizList, quizSearch, quizFilter]);

  // Filtered Badges
  const filteredBadges = useMemo(() => {
    return badgeCatalog.filter(b => {
      if (badgeUnlockedOnly && !b.isUnlocked) return false;
      if (badgeCategory !== 'all' && b.category !== badgeCategory) return false;
      return true;
    });
  }, [badgeCatalog, badgeCategory, badgeUnlockedOnly]);

  const unlockedBadgeCount = useMemo(() => badgeCatalog.filter(b => b.isUnlocked).length, [badgeCatalog]);

  return (
    <div className="min-h-screen py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Student Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
            {isLoggedIn ? 'Student Dashboard' : 'Guest Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white pt-1">
            {isLoggedIn ? `Welcome, ${profile.displayName || 'Developer'} 👋` : 'Welcome, Guest 👋'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/onboarding"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700/80 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 hover:border-sky-400 dark:hover:border-cyan-500 transition-colors w-fit shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retake Guided Tour</span>
          </Link>
        </div>
      </div>

      {/* Streak At Risk Banner if inactive today */}
      <StreakTracker variant="banner" />

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

      {/* Primary Analytics & Progress Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Overall % Circular Progress Card (5 columns) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-sky-50/30 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-cyan-950/30 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-600 dark:text-cyan-400 font-bold">Overall Progress</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Curriculum Mastery</h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-sky-100 dark:bg-cyan-950/80 border border-sky-300 dark:border-cyan-500/40 text-xs font-mono font-bold text-sky-800 dark:text-cyan-300 flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{overallStats.masteryTier.name}</span>
            </div>
          </div>

          {/* Radial / Gauge Visualization & Center Metric */}
          <div className="flex items-center justify-around gap-4 py-2">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-slate-100 dark:text-slate-800/80 stroke-current"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  className="text-sky-500 dark:text-cyan-400 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallStats.overallPercent / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {overallStats.overallPercent}%
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">
                  Completed
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-left">
              <div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">Topics Mastered</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {overallStats.completedTopics} <span className="text-xs font-normal text-slate-400">/ {overallStats.totalTopics} Lessons</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">Avg Quiz Accuracy</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {overallStats.averageQuizScore !== null ? `${overallStats.averageQuizScore}%` : 'No quizzes yet'}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">Est. Study Completed</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {Math.round(overallStats.completedEstimatedMinutes / 60)}h {overallStats.completedEstimatedMinutes % 60}m
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar & Next Tier Hint */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300">Level {overallStats.masteryTier.level} of 5</span>
              {overallStats.masteryTier.nextTier ? (
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  +{overallStats.masteryTier.topicsToNextTier} topics to <strong className="text-sky-600 dark:text-cyan-400">{overallStats.masteryTier.nextTier}</strong>
                </span>
              ) : (
                <span className="text-amber-500 font-bold">Max Rank Achieved! 🏆</span>
              )}
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallStats.overallPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Interactive Metric Cards (7 columns) */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Metric 1: Per-Module Bars Navigation */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all space-y-2 shadow-sm ${
              activeTab === 'overview'
                ? 'border-sky-500 dark:border-cyan-400 ring-2 ring-sky-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono text-sky-600 dark:text-cyan-400 uppercase font-bold">Modules</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-cyan-950/60 border border-sky-200 dark:border-cyan-800 flex items-center justify-center text-sky-600 dark:text-cyan-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {moduleStats.filter(m => m.status === 'completed').length} <span className="text-xs font-normal text-slate-400">/ 10 Done</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              View per-module progress bars →
            </div>
          </button>

          {/* Metric 2: Quiz Scores Navigation */}
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all space-y-2 shadow-sm ${
              activeTab === 'quizzes'
                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">Quiz Scores</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {overallStats.totalQuizzesAttempted} <span className="text-xs font-normal text-slate-400">Quizzes</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {overallStats.quizzesPassed} passed ({overallStats.averageQuizScore !== null ? `${overallStats.averageQuizScore}% avg` : '0%'}) →
            </div>
          </button>

          {/* Metric 3: Badges Earned Navigation */}
          <button
            onClick={() => setActiveTab('badges')}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all space-y-2 shadow-sm ${
              activeTab === 'badges'
                ? 'border-purple-500 dark:border-violet-400 ring-2 ring-purple-400/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono text-purple-600 dark:text-violet-400 uppercase font-bold">Badges Earned</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-violet-400">
              {unlockedBadgeCount} <span className="text-xs font-normal text-slate-400">/ {badgeCatalog.length}</span>
            </div>
            <div className="text-[11px] text-purple-700/80 dark:text-slate-400 font-medium">
              Explore badge milestones →
            </div>
          </button>

          {/* Metric 4: Streak */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-500/30 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono text-amber-700 dark:text-amber-400 uppercase font-bold">Learning Streak</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {streak.currentStreak} <span className="text-xs font-normal text-amber-700/70 dark:text-slate-400">Days</span>
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-slate-400 font-medium">
              Best record: {streak.longestStreak} days
            </div>
          </div>

        </div>

      </div>

      {/* "Continue Where You Left Off" Prominent Card */}
      {continueTopic && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/40 dark:to-slate-900 border-2 border-slate-200 dark:border-cyan-500/40 shadow-xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 fill-sky-600 dark:fill-cyan-400" />
              <span>{isBrandNewStudent ? 'Start Your Learning Journey' : 'Continue Where You Left Off'}</span>
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
              Module 0{continueModule.orderIndex}: {continueModule.title}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{continueTopic.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-2">{continueTopic.description}</p>
            </div>
            <Link
              href={getResumeLearningUrl(profile)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isBrandNewStudent ? 'Start Topic 01' : 'Resume Topic'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div id="dashboard-tabs" className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b-2 border-slate-200 dark:border-slate-800">
        
        {/* Tab 1: Module Breakdown */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'overview'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Module Progress Bars</span>
        </button>

        {/* Tab 2: Quiz Scores */}
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'quizzes'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Quiz Scores ({overallStats.totalQuizzesAttempted})</span>
        </button>

        {/* Tab 3: Badges */}
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'badges'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Badges Earned ({unlockedBadgeCount}/{badgeCatalog.length})</span>
        </button>

        {/* Tab 4: Saved Bookmarks */}
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold font-mono uppercase transition-all shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'bookmarks'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Topics ({bookmarks.length})</span>
        </button>
      </div>

      {/* TAB PANEL 1: Per-Module Bars & Breakdown */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Module Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-500 font-bold uppercase">Filter:</span>
              {(['all', 'in_progress', 'completed', 'not_started'] as const).map(key => {
                const labelMap = {
                  all: 'All (10)',
                  in_progress: `In Progress (${moduleStats.filter(m => m.status === 'in_progress').length})`,
                  completed: `Completed (${moduleStats.filter(m => m.status === 'completed').length})`,
                  not_started: `Not Started (${moduleStats.filter(m => m.status === 'not_started').length})`
                };
                return (
                  <button
                    key={key}
                    onClick={() => setModuleFilter(key)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      moduleFilter === key
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {labelMap[key]}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Showing {filteredModules.length} Modules
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredModules.map((item) => {
              const { module: mod, topics, totalTopics, completedTopics, progressPercent, averageQuizScore, status } = item;
              
              // First uncompleted topic for quick action
              const nextTopic = topics.find(t => progress[t.id]?.status !== 'completed') || topics[0];

              return (
                <div 
                  key={mod.id} 
                  className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all space-y-4 shadow-sm ${
                    status === 'completed' 
                      ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/10'
                      : status === 'in_progress'
                      ? 'border-sky-300 dark:border-cyan-500/40'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Module Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-sky-600 dark:text-cyan-400">
                          Module 0{mod.orderIndex}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {mod.difficulty}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-mono font-black text-slate-900 dark:text-white">
                        {progressPercent}%
                      </span>
                      <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {completedTopics}/{totalTopics} Done
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          progressPercent === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span>{topics.length} Topic Units</span>
                      {averageQuizScore !== null ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          Avg Quiz: {averageQuizScore}%
                        </span>
                      ) : (
                        <span>No quiz attempts yet</span>
                      )}
                    </div>
                  </div>

                  {/* Topic Mini Stepper Preview */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-2">Lessons & Quiz Scores</div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                      {topics.map((t, idx) => {
                        const isDone = progress[t.id]?.status === 'completed';
                        const score = progress[t.id]?.score;

                        return (
                          <Link
                            key={t.id}
                            href={`/curriculum/${mod.slug}/${t.slug}?tab=watch`}
                            className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-between gap-1.5 transition-colors ${
                              isDone
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 hover:border-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">#{idx + 1}</span>
                              <span className="truncate text-[11px]">{t.title}</span>
                            </div>

                            {isDone ? (
                              <div className="flex items-center space-x-1 shrink-0">
                                {score !== undefined && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                    {score}%
                                  </span>
                                )}
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">pending</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/curriculum/${mod.slug}`}
                      className="text-xs font-mono font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Module Syllabus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {nextTopic && (
                      <Link
                        href={`/curriculum/${mod.slug}/${nextTopic.slug}?tab=watch`}
                        className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold font-mono transition-all flex items-center space-x-1"
                      >
                        <span>{progressPercent === 100 ? 'Review' : 'Resume'}</span>
                        <Play className="w-3 h-3 fill-white" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB PANEL 2: Quiz Scores & Scorecard */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          
          {/* Quiz Performance Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase font-bold">Total Attempts</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {overallStats.totalQuizzesAttempted} <span className="text-xs font-normal text-slate-400">/ {TOPICS.length}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-mono text-emerald-500 uppercase font-bold">Passed (≥70%)</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {overallStats.quizzesPassed}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-mono text-amber-500 uppercase font-bold">Perfect (100%)</span>
              <div className="text-xl sm:text-2xl font-black text-amber-500">
                {overallStats.perfectQuizzes} 🌟
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] sm:text-xs font-mono text-sky-500 uppercase font-bold">Average Score</span>
              <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-cyan-400">
                {overallStats.averageQuizScore !== null ? `${overallStats.averageQuizScore}%` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Search & Filter Tools */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
                placeholder="Search topic or module quiz..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'mastered', 'passed', 'needs_practice', 'unattempted'] as const).map((key) => {
                const mapLabels = {
                  all: 'All',
                  mastered: 'Mastered (90%+)',
                  passed: 'Passed (70-89%)',
                  needs_practice: 'Needs Review (<70%)',
                  unattempted: 'Not Attempted'
                };
                return (
                  <button
                    key={key}
                    onClick={() => setQuizFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                      quizFilter === key
                        ? 'bg-sky-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-300'
                    }`}
                  >
                    {mapLabels[key]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quizzes Scorecard List */}
          <div className="space-y-3">
            {filteredQuizzes.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No quizzes match this filter.</p>
                <p className="text-xs text-slate-500">Try changing your search keywords or filter pills above.</p>
              </div>
            ) : (
              filteredQuizzes.map(({ topic, module: mod, score, hasAttempted, isMastered, isPassed, isNeedsPractice, completedAt }) => {
                return (
                  <div
                    key={topic.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-sky-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/60 border border-sky-200 dark:border-cyan-800 px-2 py-0.5 rounded-md">
                          Module 0{mod?.orderIndex || 1} • {mod?.title}
                        </span>
                        
                        {isMastered && (
                          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md">
                            Mastered (Grade A+)
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                            Passed
                          </span>
                        )}
                        {isNeedsPractice && (
                          <span className="text-[10px] font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded-md">
                            Needs Review
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">
                        {topic.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        {hasAttempted ? (
                          <>
                            <div className="text-lg sm:text-xl font-black font-mono text-slate-900 dark:text-white">
                              {score}%
                            </div>
                            {completedAt && (
                              <div className="text-[10px] font-mono text-slate-400">
                                {new Date(completedAt).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-mono text-slate-400">Not Attempted</span>
                        )}
                      </div>

                      <Link
                        href={`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=quiz`}
                        className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-1.5 ${
                          hasAttempted
                            ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                            : 'bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] text-white shadow-sm'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{hasAttempted ? 'Retake Quiz' : 'Take Quiz'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB PANEL 3: Badges Earned Showcase */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          
          {/* Badge Category Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'Milestones', 'Quizzes', 'Modules', 'Streaks'] as const).map((cat) => {
                return (
                  <button
                    key={cat}
                    onClick={() => setBadgeCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                      badgeCategory === cat
                        ? 'bg-purple-700 text-white dark:bg-purple-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Badges' : cat}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={badgeUnlockedOnly}
                onChange={(e) => setBadgeUnlockedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Unlocked Only ({unlockedBadgeCount})</span>
            </label>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredBadges.map((b) => {
              return (
                <div
                  key={b.id}
                  className={`p-5 sm:p-6 rounded-3xl border-2 transition-all space-y-3 relative overflow-hidden flex flex-col justify-between ${
                    b.isUnlocked
                      ? 'bg-gradient-to-b from-white to-purple-50/40 dark:from-slate-900 dark:to-purple-950/20 border-purple-300 dark:border-violet-500/40 shadow-md'
                      : 'bg-white/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-90'
                  }`}
                >
                  {/* Top Status Icon & Category */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        b.isUnlocked
                          ? 'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-300 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {b.isUnlocked ? (
                        <Award className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {b.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 dark:text-white text-base">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {b.description}
                    </p>
                  </div>

                  {/* Progress / Unlocked Status */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    {b.isUnlocked ? (
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Unlocked!</span>
                        </span>
                        {b.earnedAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(b.earnedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{b.requirementText}</span>
                          <span className="font-bold">{b.currentValue}/{b.targetValue}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${b.progressPercent}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB PANEL 4: Saved / Bookmarked Topics */}
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
