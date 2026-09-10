'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MODULES, getOrderedCurriculumTopics } from '@/data/seedModules';
import { getAllTopics, getTopicBySlugs, getTopicQuiz, getTopicChapters } from '@/lib/curriculumService';
import { useWaynauticStore } from '@/lib/store';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MarkdownNotes } from '@/components/MarkdownNotes';
import { QuizEngine } from '@/components/QuizEngine';
import { StreakTracker } from '@/components/StreakTracker';
import { generateAndDownloadTopicPdf } from '@/lib/pdfNotesGenerator';
import { 
  Play, 
  BookOpen, 
  HelpCircle, 
  Bookmark, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Lock,
  Download,
  Sparkles
} from 'lucide-react';
import { trackTopicCompleted, trackQuizCompleted, trackPdfDownloaded, trackBookmarkToggled } from '@/lib/analytics';

// Dynamic code-split imports for secondary interactive components
const TopicRatingWidget = dynamic(
  () => import('@/components/TopicRatingWidget').then((mod) => mod.TopicRatingWidget),
  {
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 animate-pulse h-28 flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400">Loading topic feedback...</div>
      </div>
    ),
    ssr: false,
  }
);

const TopicComments = dynamic(
  () => import('@/components/TopicComments').then((mod) => mod.TopicComments),
  {
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 animate-pulse h-44 flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400">Loading community Q&A...</div>
      </div>
    ),
    ssr: false,
  }
);

const RecommendedTopics = dynamic(
  () => import('@/components/RecommendedTopics').then((mod) => mod.RecommendedTopics),
  {
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 animate-pulse h-52 flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400">Finding recommended topics...</div>
      </div>
    ),
    ssr: false,
  }
);

export function TopicWorkspaceClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleSlug = params.moduleSlug as string;
  const topicSlug = params.topicSlug as string;

  const { profile, progress, bookmarks, toggleBookmarkTopic, markTopicProgress, saveQuizAttempt, saveLastAccessedTopic } = useWaynauticStore();

  const [, setTopicsVersion] = useState(0);

  // Listen for admin curriculum changes
  useEffect(() => {
    const handleCurriculumChange = () => {
      setTopicsVersion((v) => v + 1);
    };
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const moduleData = MODULES.find((m) => m.slug === moduleSlug);
  const topic = getTopicBySlugs(moduleSlug, topicSlug);

  const topicId = topic?.id;
  const isLoggedIn = Boolean(profile.userId || profile.email);
  const currentTab = (searchParams.get('tab') as 'watch' | 'read' | 'quiz') || 'watch';

  // Record last accessed topic & tab for deep-link Resume Learning
  useEffect(() => {
    if (topicId && isLoggedIn) {
      saveLastAccessedTopic(topicId, currentTab);
    }
  }, [topicId, currentTab, isLoggedIn, saveLastAccessedTopic]);

  if (!moduleData || !topic) {
    notFound();
  }

  // If not logged in, enforce login requirement before starting learning
  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-[#0D121F] border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
          
          <div className="w-16 h-16 mx-auto rounded-3xl bg-sky-100 dark:bg-cyan-950/80 border-2 border-sky-300 dark:border-cyan-500/40 flex items-center justify-center text-sky-600 dark:text-cyan-400 shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
              Student Login Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Log In to Start Learning
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              You must be logged into your Waynautic Academy account to access <strong className="text-slate-900 dark:text-white">&quot;{topic.title}&quot;</strong>, stream video lectures, view code notes, and take quizzes.
            </p>
          </div>

          {/* Benefits */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Access to all 10 AI engineering modules & videos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Real-time progress saving, daily streaks & bookmarks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Official verified certificates upon completing paths</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href={`/login?redirectTo=/curriculum/${moduleSlug}/${topicSlug}`}
              className="w-full sm:w-1/2 py-3.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-1/2 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm transition-all text-center min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              Create Free Account
            </Link>
          </div>

        </div>
      </div>
    );
  }

  const setTab = (newTab: 'watch' | 'read' | 'quiz') => {
    router.replace(`/curriculum/${moduleSlug}/${topicSlug}?tab=${newTab}`, { scroll: false });
  };

  // Keyboard support for tab bar
  const handleKeyDownTab = (e: React.KeyboardEvent, targetTab: 'watch' | 'read' | 'quiz') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setTab(targetTab);
    }
  };

  // Find ordered curriculum topics across all modules in correct sequential roadmap order
  const allActiveTopics = getAllTopics();
  const orderedTopics = getOrderedCurriculumTopics(allActiveTopics);
  const currentTopicIndex = orderedTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentTopicIndex > 0 ? orderedTopics[currentTopicIndex - 1] : null;

  // Next topic: find next incomplete topic in sequence ahead of current topic
  const remainingTopics = orderedTopics.slice(currentTopicIndex + 1);
  const nextIncompleteTopic = remainingTopics.find((t) => progress[t.id]?.status !== 'completed');
  const nextTopic = nextIncompleteTopic || (remainingTopics.length > 0 ? remainingTopics[0] : null);

  // Topic order index within current module
  const moduleTopics = allActiveTopics.filter((t) => t.moduleSlug === moduleData.slug);
  const topicIndexInModule = moduleTopics.findIndex((t) => t.id === topic.id) + 1;
  const topicIndexStr = topicIndexInModule < 10 ? `0${topicIndexInModule}` : topicIndexInModule;

  const isCompleted = progress[topic.id]?.status === 'completed';
  const isBookmarked = bookmarks.includes(topic.id);
  const quizQuestions = getTopicQuiz(topic.id, topic.title);
  const topicChapters = getTopicChapters(topic, allActiveTopics);

  const [showAutoCompletedToast, setShowAutoCompletedToast] = useState(false);

  const handleVideoProgress90 = () => {
    markTopicProgress(topic.id, 'completed');
    trackTopicCompleted(topic.title, topic.id);
    setShowAutoCompletedToast(true);
    setTimeout(() => setShowAutoCompletedToast(false), 6000);
  };

  const handleQuizComplete = (scorePercent: number) => {
    saveQuizAttempt(topic.id, Math.round((scorePercent / 100) * quizQuestions.length), quizQuestions.length);
    trackQuizCompleted(topic.title, scorePercent, topic.id);
    if (scorePercent >= 70) {
      markTopicProgress(topic.id, 'completed', scorePercent);
      trackTopicCompleted(topic.title, topic.id);
    } else {
      markTopicProgress(topic.id, 'in_progress', scorePercent);
    }
  };

  const handleDownloadPdfNotes = () => {
    trackPdfDownloaded(topic.title, 'topic');
    generateAndDownloadTopicPdf({
      title: topic.title,
      slug: topic.slug,
      textContent: topic.textContent,
      estimatedMinutes: topic.estimatedMinutes,
      moduleTitle: moduleData.title
    });
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-24 sm:pb-12">
      
      {/* Top Breadcrumbs & Topic Action Bar */}
      <nav aria-label="Breadcrumb" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Link href="/curriculum" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:outline-none rounded">Curriculum</Link>
          <span>/</span>
          <Link href={`/curriculum/${moduleSlug}`} className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors truncate max-w-[140px] sm:max-w-none focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:outline-none rounded">{moduleData.title}</Link>
          <span>/</span>
          <span className="text-sky-600 dark:text-cyan-400 font-bold truncate max-w-[160px] sm:max-w-[240px]">{topic.title}</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          
          {/* Streak Tracker Pill */}
          <StreakTracker variant="compact" />

          {/* Download Notes PDF Button */}
          <button
            onClick={handleDownloadPdfNotes}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all min-h-[38px] bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            title="Download printable study notes PDF"
            aria-label="Download printable study notes PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Download Notes (PDF)</span>
            <span className="sm:hidden">PDF Notes</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={async () => {
              if (!isBookmarked) {
                await toggleBookmarkTopic(topic.id);
              }
              router.push('/dashboard?tab=bookmarks');
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all min-h-[38px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              isBookmarked
                ? 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-500/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white'
            }`}
            title="Bookmark topic and view in Bookmarks tab"
            aria-label={isBookmarked ? "Topic saved in bookmarks" : "Save topic to bookmarks"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-sky-600 dark:fill-cyan-400' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Mark Complete Button */}
          <button
            onClick={() => markTopicProgress(topic.id, isCompleted ? 'in_progress' : 'completed')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-extrabold transition-all shadow-sm active:scale-95 min-h-[38px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/60 shadow-emerald-500/10'
                : 'bg-[#58CC02] hover:bg-[#61E002] text-white border-[#58A700] shadow-[0_2px_0_0_#58A700]'
            }`}
            aria-label={isCompleted ? "Topic completed. Click to mark in progress" : "Mark topic as complete"}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600 fill-emerald-100 dark:text-emerald-400 dark:fill-emerald-400/20' : 'text-white'}`} />
            <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
          </button>

        </div>
      </nav>

      {/* Auto-Completed 90% Notification Banner */}
      {showAutoCompletedToast && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-500/50 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-bold shadow-md animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Awesome job! You reached 90% of the video — this topic has been automatically marked as complete! 🎉</span>
          </div>
          <button
            onClick={() => setShowAutoCompletedToast(false)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Topic Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2.5 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400">
          <span>Module 0{moduleData.orderIndex}</span>
          <span>•</span>
          <span>Topic {topicIndexStr}</span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.estimatedMinutes} mins</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {topic.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          {topic.description}
        </p>
      </div>

      {/* Responsive Desktop & Laptop Tab Switcher */}
      <div role="tablist" aria-label="Topic Learning Modes" className="hidden sm:flex items-center space-x-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
        <button
          role="tab"
          id="tab-watch"
          aria-selected={currentTab === 'watch'}
          aria-controls="panel-watch"
          onClick={() => setTab('watch')}
          onKeyDown={(e) => handleKeyDownTab(e, 'watch')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'watch'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Play className={`w-4 h-4 ${currentTab === 'watch' ? 'fill-white' : ''}`} />
          <span>1. Watch Video</span>
        </button>

        <button
          role="tab"
          id="tab-read"
          aria-selected={currentTab === 'read'}
          aria-controls="panel-read"
          onClick={() => setTab('read')}
          onKeyDown={(e) => handleKeyDownTab(e, 'read')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'read'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Read Notes</span>
        </button>

        <button
          role="tab"
          id="tab-quiz"
          aria-selected={currentTab === 'quiz'}
          aria-controls="panel-quiz"
          onClick={() => setTab('quiz')}
          onKeyDown={(e) => handleKeyDownTab(e, 'quiz')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'quiz'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Take Quiz</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20 ml-1">
            {quizQuestions.length}
          </span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="pt-2">
        {currentTab === 'watch' && (
          <div role="tabpanel" id="panel-watch" aria-labelledby="tab-watch">
            <VideoPlayer
              url={topic.videoUrl}
              title={topic.title}
              topicId={topic.id}
              chapters={topicChapters}
              notesContent={topic.textContent}
              moduleTitle={moduleData.title}
              onProgress90={handleVideoProgress90}
              onNavigateTopic={(targetSlug) => {
                router.push(`/curriculum/${moduleSlug}/${targetSlug}?tab=watch`);
              }}
            />
          </div>
        )}

        {currentTab === 'read' && (
          <div role="tabpanel" id="panel-read" aria-labelledby="tab-read">
            <MarkdownNotes 
              content={topic.textContent}
              topicTitle={topic.title}
              topicSlug={topic.slug}
              moduleTitle={moduleData.title}
              estimatedMinutes={topic.estimatedMinutes}
            />
          </div>
        )}

        {currentTab === 'quiz' && (
          <div role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz">
            <QuizEngine
              topicId={topic.id}
              topicTitle={topic.title}
              questions={quizQuestions}
              onCompleteQuiz={handleQuizComplete}
            />
          </div>
        )}
      </div>

      {/* Topic Interactive Rating Widget (Thumbs Up/Down & 5-Star) */}
      <TopicRatingWidget topicId={topic.id} topicTitle={topic.title} />

      {/* Lightweight Community Q&A & Comments Thread */}
      <TopicComments topicId={topic.id} topicTitle={topic.title} />

      {/* Feature 1: 'You Might Also Like' Block */}
      <RecommendedTopics currentTopic={topic} />

      {/* Previous / Next Lesson Navigation Footer */}
      <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {prevTopic ? (
          <Link
            href={`/curriculum/${prevTopic.moduleSlug}/${prevTopic.slug}?tab=watch`}
            className="w-full sm:w-auto p-4 rounded-2xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center space-x-3 group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Previous Topic</div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 truncate max-w-[200px]">
                {prevTopic.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextTopic && (
          <Link
            href={`/curriculum/${nextTopic.moduleSlug}/${nextTopic.slug}?tab=watch`}
            className="w-full sm:w-auto p-4 rounded-2xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-cyan-500/30 hover:border-sky-400 dark:hover:border-cyan-400 text-right transition-colors flex items-center justify-end space-x-3 group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
          >
            <div>
              <div className="text-[10px] font-mono text-sky-600 dark:text-cyan-400 uppercase font-bold">
                {progress[nextTopic.id]?.status === 'completed' ? 'Next Topic' : 'Next Incomplete Topic'}
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-300 truncate max-w-[200px]">
                {nextTopic.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Sticky Mobile Bottom Tab Bar (<640px viewports) with safe area support */}
      <div 
        role="tablist" 
        aria-label="Mobile Navigation Tabs" 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-around shadow-2xl pb-safe"
      >
        <button
          role="tab"
          aria-selected={currentTab === 'watch'}
          onClick={() => setTab('watch')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'watch' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40 font-black' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Play className={`w-5 h-5 mb-0.5 ${currentTab === 'watch' ? 'fill-[#1899D6]' : ''}`} />
          <span>Watch</span>
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'read'}
          onClick={() => setTab('read')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'read' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40 font-black' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Read</span>
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'quiz'}
          onClick={() => setTab('quiz')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] relative focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'quiz' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40 font-black' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span>Quiz</span>
          <span className="absolute top-1 right-2 text-[9px] font-mono px-1 rounded-full bg-sky-500 text-white font-bold">
            {quizQuestions.length}
          </span>
        </button>
      </div>

    </div>
  );
}
