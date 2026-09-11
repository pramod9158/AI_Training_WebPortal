'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MODULES, getOrderedCurriculumTopics } from '@/data/seedModules';
import { getAllTopics, getTopicBySlugs, getTopicQuiz, getTopicChapters, fetchCurriculumUpdates, fetchTopicQuizUpdates } from '@/lib/curriculumService';
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
  const currentTab = (searchParams.get('tab') as 'watch' | 'read' | 'quiz') || 'watch';

  const { profile, progress, bookmarks, toggleBookmarkTopic, markTopicProgress, saveQuizAttempt, saveLastAccessedTopic } = useWaynauticStore();

  const [topicsVersion, setTopicsVersion] = useState(0);
  const [showAutoCompletedToast, setShowAutoCompletedToast] = useState(false);

  // Background fetch latest curriculum and quiz from cloud API/Supabase
  useEffect(() => {
    fetchCurriculumUpdates().then(() => {
      setTopicsVersion((v) => v + 1);
    });
  }, []);

  // Listen for admin curriculum changes across tabs and windows
  useEffect(() => {
    const handleCurriculumChange = () => {
      setTopicsVersion((v) => v + 1);
    };
    window.addEventListener('waynautic_curriculum_changed', handleCurriculumChange);
    return () => window.removeEventListener('waynautic_curriculum_changed', handleCurriculumChange);
  }, []);

  const moduleData = MODULES.find((m) => m.slug === moduleSlug);
  const topic = getTopicBySlugs(moduleSlug, topicSlug);

  // Fetch updated quiz questions for this topic in background
  useEffect(() => {
    if (topic?.id) {
      fetchTopicQuizUpdates(topic.id).then((freshQuestions) => {
        if (freshQuestions && freshQuestions.length > 0) {
          setTopicsVersion((v) => v + 1);
        }
      });
    }
  }, [topic?.id]);

  // If topic slug was renamed by admin, automatically replace URL without full page reload
  useEffect(() => {
    if (topic && topic.slug !== topicSlug) {
      router.replace(`/curriculum/${topic.moduleSlug}/${topic.slug}?tab=${currentTab}`, { scroll: false });
    }
  }, [topic, topicSlug, currentTab, router]);

  const topicId = topic?.id;
  const isLoggedIn = Boolean(profile.userId || profile.email);

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
              className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px] shadow-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
            >
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4 text-current" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-1/2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all text-center min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
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
      trackTopicCompleted(topic.title, topic.id);
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

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          
          {/* Streak Tracker Pill */}
          <div className="h-10 flex items-center justify-center">
            <StreakTracker variant="compact" />
          </div>

          {/* Download Notes PDF Button */}
          <button
            onClick={handleDownloadPdfNotes}
            className="h-10 flex items-center justify-center space-x-1.5 px-3 rounded-xl border text-xs font-bold transition-all bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none w-full sm:w-auto"
            title="Download printable study notes PDF"
            aria-label="Download printable study notes PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
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
            className={`h-10 flex items-center justify-center space-x-1.5 px-3 rounded-xl border text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none w-full sm:w-auto ${
              isBookmarked
                ? 'bg-amber-500/10 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white'
            }`}
            title="Bookmark topic and view in Bookmarks tab"
            aria-label={isBookmarked ? "Topic saved in bookmarks" : "Save topic to bookmarks"}
          >
            <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isBookmarked ? 'fill-amber-600 dark:fill-amber-400 text-amber-600 dark:text-amber-400' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* Mark Complete Button */}
          <button
            onClick={() => markTopicProgress(topic.id, isCompleted ? 'in_progress' : 'completed', undefined, true)}
            className={`h-10 flex items-center justify-center space-x-1.5 px-3 sm:px-4 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none w-full sm:w-auto ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700/50'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 dark:border-white'
            }`}
            aria-label={isCompleted ? "Topic completed. Click to mark in progress" : "Mark topic as complete"}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-emerald-600 fill-emerald-100 dark:text-emerald-400 dark:fill-emerald-400/20' : 'text-slate-400 dark:text-slate-600'}`} />
            <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
          </button>

        </div>
      </nav>

      {/* Auto-Completed 90% Notification Banner */}
      {showAutoCompletedToast && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-bold shadow-sm animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
      <div className="space-y-2">
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
          <span>Module 0{moduleData.orderIndex}</span>
          <span>•</span>
          <span>Topic {topicIndexStr}</span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.estimatedMinutes} mins</span>
          </span>
          <span>•</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
            moduleData.difficulty === 'Beginner' ? 'badge-diff-beginner' :
            moduleData.difficulty === 'Intermediate' ? 'badge-diff-intermediate' :
            'badge-diff-advanced'
          }`}>
            {moduleData.difficulty}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {topic.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
          {topic.description}
        </p>
      </div>

      {/* Responsive Desktop & Laptop Tab Switcher */}
      <div role="tablist" aria-label="Topic Learning Modes" className="hidden sm:flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          role="tab"
          id="tab-watch"
          aria-selected={currentTab === 'watch'}
          aria-controls="panel-watch"
          onClick={() => setTab('watch')}
          onKeyDown={(e) => handleKeyDownTab(e, 'watch')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'watch'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Play className={`w-4 h-4 ${currentTab === 'watch' ? 'fill-current' : ''}`} />
          <span>1. Watch Video</span>
        </button>

        <button
          role="tab"
          id="tab-read"
          aria-selected={currentTab === 'read'}
          aria-controls="panel-read"
          onClick={() => setTab('read')}
          onKeyDown={(e) => handleKeyDownTab(e, 'read')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'read'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'quiz'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Take Quiz</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="pt-2">
        {currentTab === 'watch' && (
          <div role="tabpanel" id="panel-watch" aria-labelledby="tab-watch">
            <VideoPlayer
              key={`vp-${topic.id}-${topic.videoUrl}`}
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
              key={`notes-${topic.id}-${topic.textContent?.length}-${topicsVersion}`}
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
              key={`quiz-${topic.id}-${quizQuestions.length}-${topicsVersion}`}
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
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prevTopic ? (
          <Link
            href={`/curriculum/${prevTopic.moduleSlug}/${prevTopic.slug}?tab=watch`}
            className="w-full p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center space-x-3 group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Previous Topic</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                {prevTopic.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextTopic && (
          <Link
            href={`/curriculum/${nextTopic.moduleSlug}/${nextTopic.slug}?tab=watch`}
            className="w-full p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-right transition-colors flex items-center justify-end space-x-3 group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none sm:col-start-2"
          >
            <div className="min-w-0">
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
                {progress[nextTopic.id]?.status === 'completed' ? 'Next Topic' : 'Next Incomplete Topic'}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                {nextTopic.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}
      </div>

      {/* Sticky Mobile Bottom Tab Bar (<640px viewports) with safe area support */}
      <div 
        role="tablist" 
        aria-label="Mobile Navigation Tabs" 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D121F]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2 flex items-center justify-around shadow-lg pb-safe"
      >
        <button
          role="tab"
          aria-selected={currentTab === 'watch'}
          onClick={() => setTab('watch')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'watch' 
              ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Play className={`w-4 h-4 mb-1 ${currentTab === 'watch' ? 'fill-current' : ''}`} />
          <span>Watch</span>
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'read'}
          onClick={() => setTab('read')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'read' 
              ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-1" />
          <span>Read</span>
        </button>

        <button
          role="tab"
          aria-selected={currentTab === 'quiz'}
          onClick={() => setTab('quiz')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] relative focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none ${
            currentTab === 'quiz' 
              ? 'text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4 mb-1" />
          <span>Quiz</span>
        </button>
      </div>

    </div>
  );
}
