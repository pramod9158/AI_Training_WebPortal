'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, notFound } from 'next/navigation';
import { TOPICS, getQuizForTopic } from '@/data/seedTopics';
import { MODULES, getOrderedCurriculumTopics } from '@/data/seedModules';
import { useWaynauticStore } from '@/lib/store';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MarkdownNotes } from '@/components/MarkdownNotes';
import { QuizEngine } from '@/components/QuizEngine';
import { 
  Play, 
  BookOpen, 
  HelpCircle, 
  Bookmark, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Lock 
} from 'lucide-react';

export default function TopicWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleSlug = params.moduleSlug as string;
  const topicSlug = params.topicSlug as string;

  const { profile, progress, bookmarks, toggleBookmarkTopic, markTopicProgress, saveQuizAttempt, saveLastAccessedTopic } = useWaynauticStore();

  const moduleData = MODULES.find((m) => m.slug === moduleSlug);
  const topic = TOPICS.find((t) => t.moduleSlug === moduleSlug && t.slug === topicSlug);

  if (!moduleData || !topic) {
    notFound();
  }

  const topicId = topic?.id;
  const isLoggedIn = Boolean(profile.userId || profile.email);

  // Record last accessed topic for Resume Learning
  React.useEffect(() => {
    if (topicId && isLoggedIn) {
      saveLastAccessedTopic(topicId);
    }
  }, [topicId, isLoggedIn, saveLastAccessedTopic]);

  if (!topic || !moduleData) {
    return notFound();
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
              className="w-full sm:w-1/2 py-3.5 rounded-xl bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_3px_0_0_#58A700] text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </Link>

            <Link
              href={`/signup?redirectTo=/curriculum/${moduleSlug}/${topicSlug}`}
              className="w-full sm:w-1/2 py-3.5 rounded-xl bg-sky-50 dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-slate-800 border-2 border-sky-300 dark:border-slate-700 text-sky-800 dark:text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center min-h-[44px]"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          <div className="pt-2">
            <Link
              href="/curriculum"
              className="text-xs text-slate-500 dark:text-slate-400 hover:underline font-bold"
            >
              ← Back to Curriculum Syllabus
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Active Tab from URL search params (defaults to 'watch')
  const currentTab = (searchParams.get('tab') as 'watch' | 'read' | 'quiz') || 'watch';

  const setTab = (newTab: 'watch' | 'read' | 'quiz') => {
    router.replace(`/curriculum/${moduleSlug}/${topicSlug}?tab=${newTab}`, { scroll: false });
  };

  // Find ordered curriculum topics across all 10 modules in correct sequential roadmap order
  const orderedTopics = getOrderedCurriculumTopics(TOPICS);
  const currentTopicIndex = orderedTopics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentTopicIndex > 0 ? orderedTopics[currentTopicIndex - 1] : null;

  // Next topic: find the next incomplete topic in sequence ahead of current topic
  const remainingTopics = orderedTopics.slice(currentTopicIndex + 1);
  const nextIncompleteTopic = remainingTopics.find((t) => progress[t.id]?.status !== 'completed');
  // If all remaining are completed, fallback to the immediate next sequential topic
  const nextTopic = nextIncompleteTopic || (remainingTopics.length > 0 ? remainingTopics[0] : null);

  // Topic order index within the current module
  const moduleTopics = TOPICS.filter((t) => t.moduleSlug === moduleData.slug);
  const topicIndexInModule = moduleTopics.findIndex((t) => t.id === topic.id) + 1;
  const topicIndexStr = topicIndexInModule < 10 ? `0${topicIndexInModule}` : topicIndexInModule;

  const isCompleted = progress[topic.id]?.status === 'completed';
  const isBookmarked = bookmarks.includes(topic.id);
  const quizQuestions = getQuizForTopic(topic.id, topic.title);

  const handleVideoProgress90 = () => {
    markTopicProgress(topic.id, 'completed');
  };

  const handleQuizComplete = (scorePercent: number) => {
    saveQuizAttempt(topic.id, Math.round((scorePercent / 100) * quizQuestions.length), quizQuestions.length);
    if (scorePercent >= 70) {
      markTopicProgress(topic.id, 'completed', scorePercent);
    } else {
      markTopicProgress(topic.id, 'in_progress', scorePercent);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 pb-24 sm:pb-12">
      
      {/* Top Breadcrumbs & Topic Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Link href="/curriculum" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">Curriculum</Link>
          <span>/</span>
          <Link href={`/curriculum/${moduleSlug}`} className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors truncate max-w-[140px] sm:max-w-none">{moduleData.title}</Link>
          <span>/</span>
          <span className="text-sky-600 dark:text-cyan-400 font-bold truncate max-w-[160px] sm:max-w-[240px]">{topic.title}</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          
          {/* Bookmark Button */}
          <button
            onClick={async () => {
              if (!isBookmarked) {
                await toggleBookmarkTopic(topic.id);
              }
              router.push('/dashboard?tab=bookmarks');
            }}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all min-h-[38px] ${
              isBookmarked
                ? 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-500/40'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white'
            }`}
            title="Bookmark topic and view in Bookmarks tab"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-sky-600 dark:fill-cyan-400' : ''}`} />
            <span>{isBookmarked ? 'Saved (View in Bookmarks)' : 'Save Topic'}</span>
          </button>

          {/* Mark Complete Button */}
          <button
            onClick={() => markTopicProgress(topic.id, isCompleted ? 'in_progress' : 'completed')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border-2 text-xs font-extrabold transition-all shadow-sm active:scale-95 min-h-[38px] ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-500/60 shadow-emerald-500/10'
                : 'bg-[#58CC02] hover:bg-[#61E002] text-white border-[#58A700] shadow-[0_2px_0_0_#58A700]'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600 fill-emerald-100 dark:text-emerald-400 dark:fill-emerald-400/20' : 'text-white'}`} />
            <span>{isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
          </button>

        </div>
      </div>

      {/* Topic Title Header */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2.5 text-xs font-mono font-bold text-sky-600 dark:text-cyan-400">
          <span>Module 0{moduleData.orderIndex}</span>
          <span>•</span>
          <span>Topic {topicIndexStr}</span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.estimatedMinutes} mins</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">{topic.title}</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{topic.description}</p>
      </div>

      {/* Responsive Desktop Tab Switcher */}
      <div className="hidden sm:flex items-center space-x-2 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setTab('watch')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            currentTab === 'watch'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Play className={`w-4 h-4 ${currentTab === 'watch' ? 'fill-white' : ''}`} />
          <span>1. Watch Video</span>
        </button>

        <button
          onClick={() => setTab('read')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            currentTab === 'read'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Read Notes</span>
        </button>

        <button
          onClick={() => setTab('quiz')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all ${
            currentTab === 'quiz'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] shadow-[0_3px_0_0_#1899D6]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Take Quiz</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="pt-2">
        {currentTab === 'watch' && (
          <VideoPlayer
            url={topic.videoUrl}
            title={topic.title}
            onProgress90={handleVideoProgress90}
          />
        )}

        {currentTab === 'read' && (
          <MarkdownNotes content={topic.textContent} />
        )}

        {currentTab === 'quiz' && (
          <QuizEngine
            topicId={topic.id}
            topicTitle={topic.title}
            questions={quizQuestions}
            onCompleteQuiz={handleQuizComplete}
          />
        )}
      </div>

      {/* Previous / Next Lesson Navigation Footer */}
      <div className="pt-8 border-t-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {prevTopic ? (
          <Link
            href={`/curriculum/${prevTopic.moduleSlug}/${prevTopic.slug}?tab=watch`}
            className="w-full sm:w-auto p-4 rounded-2xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-colors flex items-center space-x-3 group"
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
            className="w-full sm:w-auto p-4 rounded-2xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-cyan-500/30 hover:border-sky-400 dark:hover:border-cyan-400 text-right transition-colors flex items-center justify-end space-x-3 group"
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

      {/* Sticky Mobile Bottom Tab Bar (<640px viewports) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t-2 border-slate-200 dark:border-slate-800 p-2 flex items-center justify-around shadow-2xl pb-3">
        <button
          onClick={() => setTab('watch')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] ${
            currentTab === 'watch' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Play className={`w-5 h-5 mb-1 ${currentTab === 'watch' ? 'fill-[#1899D6]' : ''}`} />
          <span>Watch</span>
        </button>

        <button
          onClick={() => setTab('read')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] ${
            currentTab === 'read' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span>Read</span>
        </button>

        <button
          onClick={() => setTab('quiz')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] min-w-[70px] ${
            currentTab === 'quiz' 
              ? 'text-[#1899D6] bg-sky-50 dark:bg-cyan-950/40' 
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span>Quiz</span>
        </button>
      </div>

    </div>
  );
}
