'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter, notFound } from 'next/navigation';
import { TOPICS, getQuizForTopic } from '@/data/seedTopics';
import { MODULES } from '@/data/seedModules';
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
  Sparkles
} from 'lucide-react';

export default function TopicWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const moduleSlug = params?.moduleSlug as string;
  const topicSlug = params?.topicSlug as string;

  const { progress, bookmarks, markTopicProgress, saveQuizAttempt, saveLastAccessedTopic, toggleBookmarkTopic } = useWaynauticStore();

  const topic = TOPICS.find((t) => t.moduleSlug === moduleSlug && t.slug === topicSlug);
  const moduleData = MODULES.find((m) => m.slug === moduleSlug);

  // Record last accessed topic for Resume Learning
  React.useEffect(() => {
    if (topic) {
      saveLastAccessedTopic(topic.id);
    }
  }, [topic?.id]);

  if (!topic || !moduleData) {
    return notFound();
  }

  // Active Tab from URL search params (defaults to 'watch')
  const currentTab = (searchParams.get('tab') as 'watch' | 'read' | 'quiz') || 'watch';

  const setTab = (newTab: 'watch' | 'read' | 'quiz') => {
    router.replace(`/curriculum/${moduleSlug}/${topicSlug}?tab=${newTab}`, { scroll: false });
  };

  // Find previous and next topic units
  const currentTopicIndex = TOPICS.findIndex((t) => t.id === topic.id);
  const prevTopic = currentTopicIndex > 0 ? TOPICS[currentTopicIndex - 1] : null;
  const nextTopic = currentTopicIndex < TOPICS.length - 1 ? TOPICS[currentTopicIndex + 1] : null;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <Link href="/curriculum" className="hover:text-cyan-400">Curriculum</Link>
          <span>/</span>
          <Link href={`/curriculum/${moduleSlug}`} className="hover:text-cyan-400">{moduleData.title}</Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold truncate max-w-[200px]">{topic.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmarkTopic(topic.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isBookmarked
                ? 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save Topic'}</span>
          </button>

          {/* Mark Complete Button */}
          <button
            onClick={() => markTopicProgress(topic.id, isCompleted ? 'in_progress' : 'completed')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
          </button>

        </div>
      </div>

      {/* Topic Title Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-3 text-xs font-mono text-cyan-400">
          <span>Module 0{moduleData.orderIndex}</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{topic.estimatedMinutes} mins</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{topic.title}</h1>
        <p className="text-sm text-slate-300">{topic.description}</p>
      </div>

      {/* Responsive Desktop Tab Switcher */}
      <div className="hidden sm:flex items-center space-x-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setTab('watch')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            currentTab === 'watch'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Play className={`w-4 h-4 ${currentTab === 'watch' ? 'fill-black' : ''}`} />
          <span>1. Watch Video</span>
        </button>

        <button
          onClick={() => setTab('read')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            currentTab === 'read'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Read Notes</span>
        </button>

        <button
          onClick={() => setTab('quiz')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            currentTab === 'quiz'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
      <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {prevTopic ? (
          <Link
            href={`/curriculum/${prevTopic.moduleSlug}/${prevTopic.slug}?tab=watch`}
            className="w-full sm:w-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-colors flex items-center space-x-3 group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Previous Topic</div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[200px]">
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
            className="w-full sm:w-auto p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-right transition-colors flex items-center justify-end space-x-3 group"
          >
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase">Next Topic</div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate max-w-[200px]">
                {nextTopic.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Sticky Mobile Bottom Tab Bar (<640px viewports) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800 p-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setTab('watch')}
          className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${
            currentTab === 'watch' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Play className="w-5 h-5 mb-1" />
          <span>Watch</span>
        </button>

        <button
          onClick={() => setTab('read')}
          className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${
            currentTab === 'read' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span>Read</span>
        </button>

        <button
          onClick={() => setTab('quiz')}
          className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${
            currentTab === 'quiz' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span>Quiz</span>
        </button>
      </div>

    </div>
  );
}
