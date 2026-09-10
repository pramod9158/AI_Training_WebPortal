'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, MessageSquare, Check, Sparkles } from 'lucide-react';
import { loadTopicUserRating, fetchTopicRatingsFromDb, saveTopicRating, getTopicRatingStats } from '@/lib/store';
import { TopicRating } from '@/lib/types';
import { trackRatingSubmitted } from '@/lib/analytics';

interface TopicRatingWidgetProps {
  topicId: string;
  topicTitle: string;
}

export function TopicRatingWidget({ topicId, topicTitle }: TopicRatingWidgetProps) {
  const [userRating, setUserRating] = useState<TopicRating | null>(null);
  const [stats, setStats] = useState({ upvotes: 0, downvotes: 0, avgStars: 5.0, totalVotes: 0 });
  const [starRating, setStarRating] = useState<number>(5);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [vote, setVote] = useState<'up' | 'down' | undefined>('up');
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [submittedToast, setSubmittedToast] = useState<boolean>(false);

  useEffect(() => {
    // 1. Instant local render
    const r = loadTopicUserRating(topicId);
    if (r) {
      setUserRating(r);
      setVote(r.userVote);
      setStarRating(r.starRating || 5);
      setFeedback(r.feedbackText || '');
    }
    setStats(getTopicRatingStats(topicId));

    // 2. Live Supabase database hydration
    fetchTopicRatingsFromDb(topicId).then((live) => {
      if (live.userRating) {
        setUserRating(live.userRating);
        setVote(live.userRating.userVote);
        setStarRating(live.userRating.starRating || 5);
        setFeedback(live.userRating.feedbackText || '');
      }
      setStats(live.stats);
    });
  }, [topicId]);

  const handleVote = async (newVote: 'up' | 'down') => {
    setVote(newVote);
    const updated = await saveTopicRating(topicId, newVote, starRating, feedback);
    trackRatingSubmitted(topicId, 'vote', newVote);
    setUserRating(updated);
    setStats(getTopicRatingStats(topicId));
    triggerToast();
  };

  const handleStarSelect = async (stars: number) => {
    setStarRating(stars);
    const updated = await saveTopicRating(topicId, vote, stars, feedback);
    trackRatingSubmitted(topicId, 'stars', stars);
    setUserRating(updated);
    setStats(getTopicRatingStats(topicId));
    triggerToast();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await saveTopicRating(topicId, vote, starRating, feedback);
    setUserRating(updated);
    setShowFeedbackInput(false);
    triggerToast();
  };

  const triggerToast = () => {
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  const upvotePercent = stats.totalVotes > 0 
    ? Math.round((stats.upvotes / stats.totalVotes) * 100) 
    : 100;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
      
      {/* Widget Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
              Lesson Feedback
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{stats.avgStars.toFixed(1)} / 5.0</span>
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white pt-0.5">
            Was this topic helpful?
          </h3>
        </div>

        {/* Aggregate Ratings Metric Pills */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ThumbsUp className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
            <span className="font-bold">{upvotePercent}% positive</span>
          </div>
          <span className="text-slate-400">({stats.totalVotes} reviews)</span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Thumbs Up / Down Quick Buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => handleVote('up')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border-2 text-xs font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[42px] ${
              vote === 'up'
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_2px_0_0_#047857]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${vote === 'up' ? 'fill-white' : ''}`} />
            <span>Thumbs Up ({stats.upvotes})</span>
          </button>

          <button
            onClick={() => handleVote('down')}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border-2 text-xs font-extrabold transition-all flex items-center justify-center space-x-2 min-h-[42px] ${
              vote === 'down'
                ? 'bg-rose-500 text-white border-rose-600 shadow-[0_2px_0_0_#BE123C]'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
            }`}
          >
            <ThumbsDown className={`w-4 h-4 ${vote === 'down' ? 'fill-white' : ''}`} />
            <span>Needs Work ({stats.downvotes})</span>
          </button>
        </div>

        {/* 5-Star Interactive Rating */}
        <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mr-1.5">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => {
            const active = (hoverStar || starRating) >= star;
            return (
              <button
                key={star}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => handleStarSelect(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

      </div>

      {/* Optional Written Feedback Toggle */}
      {!showFeedbackInput ? (
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={() => setShowFeedbackInput(true)}
            className="text-sky-600 dark:text-cyan-400 font-bold font-mono hover:underline flex items-center space-x-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{feedback ? 'Edit written review' : '+ Add written feedback for instructor'}</span>
          </button>
          {userRating && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Feedback saved</span>
            </span>
          )}
        </div>
      ) : (
        <form onSubmit={handleFeedbackSubmit} className="space-y-2 pt-2 animate-in fade-in">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What did you find most helpful or confusing in this lesson?"
            rows={2}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500"
          />
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowFeedbackInput(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm"
            >
              Save Feedback
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Toast */}
      {submittedToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center space-x-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Thank you! Your rating helps improve Waynautic Academy curriculum.</span>
        </div>
      )}

    </div>
  );
}
