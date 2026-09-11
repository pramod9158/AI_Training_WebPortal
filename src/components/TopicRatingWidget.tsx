'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, MessageSquare, Check, Sparkles, User, MessageCircle, Edit } from 'lucide-react';
import { loadTopicUserRating, fetchTopicRatingsFromDb, saveTopicRating, getTopicRatingStats } from '@/lib/store';
import { TopicRating } from '@/lib/types';
import { trackRatingSubmitted } from '@/lib/analytics';

interface TopicRatingWidgetProps {
  topicId: string;
  topicTitle: string;
}

export function TopicRatingWidget({ topicId, topicTitle }: TopicRatingWidgetProps) {
  const [userRating, setUserRating] = useState<TopicRating | null>(null);
  const [stats, setStats] = useState({ upvotes: 0, downvotes: 0, avgStars: 0, totalVotes: 0, starRatingsCount: 0 });
  const [starRating, setStarRating] = useState<number>(0);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [vote, setVote] = useState<'up' | 'down' | undefined>(undefined);
  const [feedback, setFeedback] = useState<string>('');
  const [allReviews, setAllReviews] = useState<TopicRating[]>([]);
  const [showFeedbackInput, setShowFeedbackInput] = useState<boolean>(false);
  const [submittedToast, setSubmittedToast] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    // 1. Instant local render
    const r = loadTopicUserRating(topicId);
    if (r) {
      setUserRating(r);
      setVote(r.userVote);
      setStarRating(r.starRating || 0);
      setFeedback(r.feedbackText || '');
    } else {
      setUserRating(null);
      setVote(undefined);
      setStarRating(0);
      setFeedback('');
    }
    setStats(getTopicRatingStats(topicId));

    // 2. Live cross-device server & database hydration
    fetchTopicRatingsFromDb(topicId).then((live) => {
      if (live.userRating) {
        setUserRating(live.userRating);
        setVote(live.userRating.userVote);
        setStarRating(live.userRating.starRating || 0);
        setFeedback(live.userRating.feedbackText || '');
      }
      setStats(live.stats);
      setAllReviews(live.ratings || []);
    });
  }, [topicId]);

  const handleVote = async (newVote: 'up' | 'down') => {
    const updated = await saveTopicRating(topicId, newVote, starRating > 0 ? starRating : undefined, feedback);
    trackRatingSubmitted(topicId, 'vote', newVote);
    setUserRating(updated.rating);
    setVote(newVote);
    setStats(updated.stats);
    setAllReviews(updated.ratings);
    setIsEditing(false);
    triggerToast();
  };

  const handleStarSelect = async (stars: number) => {
    setStarRating(stars);
    const updated = await saveTopicRating(topicId, vote, stars, feedback);
    trackRatingSubmitted(topicId, 'stars', stars);
    setUserRating(updated.rating);
    setStats(updated.stats);
    setAllReviews(updated.ratings);
    setIsEditing(false);
    triggerToast();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await saveTopicRating(topicId, vote, starRating > 0 ? starRating : undefined, feedback);
    setUserRating(updated.rating);
    setStats(updated.stats);
    setAllReviews(updated.ratings);
    setShowFeedbackInput(false);
    setIsEditing(false);
    triggerToast();
  };

  const triggerToast = () => {
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 4000);
  };

  const upvotePercent = stats.totalVotes > 0 
    ? Math.round((stats.upvotes / stats.totalVotes) * 100) 
    : 100;

  // Filter out reviews that contain written feedback for the community feed
  const writtenReviews = allReviews.filter(
    (r) => r.feedbackText && r.feedbackText.trim().length > 0
  );

  // Check if current user has already submitted feedback
  const hasGivenFeedback = Boolean(
    userRating && (
      (typeof userRating.starRating === 'number' && userRating.starRating > 0) ||
      userRating.userVote ||
      (userRating.feedbackText && userRating.feedbackText.trim().length > 0)
    )
  );

  // Lock feedback once given unless user explicitly clicks Edit
  const isLocked = hasGivenFeedback && !isEditing;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      
      {/* Widget Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold">
              Lesson Feedback & Ratings
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold flex items-center space-x-1 border border-amber-200 dark:border-amber-800/50">
              <Star className={`w-3 h-3 ${stats.starRatingsCount > 0 ? 'fill-amber-400 text-amber-500' : 'text-slate-400 fill-none'}`} />
              <span>
                {stats.starRatingsCount > 0 
                  ? `${stats.avgStars.toFixed(1)} / 5.0 (${stats.starRatingsCount} ${stats.starRatingsCount === 1 ? 'rating' : 'ratings'})`
                  : 'No ratings yet'}
              </span>
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white pt-0.5">
            How would you rate this topic?
          </h3>
        </div>

        {/* Aggregate Ratings Metric Pills */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ThumbsUp className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
            <span className="font-bold">{stats.totalVotes > 0 ? `${upvotePercent}% positive` : '100% positive'}</span>
          </div>
          <span className="text-slate-400">({stats.totalVotes} {stats.totalVotes === 1 ? 'response' : 'responses'})</span>
        </div>
      </div>

      {/* Confirmation Toast */}
      {submittedToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center space-x-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Thank you! Your feedback has been recorded and locked in.</span>
        </div>
      )}

      {/* -------------------------------------------------------------------
       * STATE 1: LOCKED IN (User has given feedback and is not currently editing)
       * Prevents multiple submissions until user explicitly clicks "Edit Feedback"
       * ------------------------------------------------------------------- */}
      {isLocked ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Check className="w-3 h-3" />
                <span>Your Feedback is Locked In</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• Recorded once per user</span>
            </div>

            <div className="flex items-center flex-wrap gap-2.5 text-xs font-bold text-slate-900 dark:text-white pt-0.5">
              {userRating?.starRating && userRating.starRating > 0 ? (
                <div className="flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= userRating.starRating!
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-700 fill-none'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-amber-800 dark:text-amber-300 text-xs font-bold">
                    {userRating.starRating} Stars
                  </span>
                </div>
              ) : null}

              {userRating?.userVote && (
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5">
                  {userRating.userVote === 'up' ? (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600" />
                      <span>Thumbs Up</span>
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
                      <span>Needs Work</span>
                    </>
                  )}
                </span>
              )}
            </div>

            {userRating?.feedbackText && (
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mt-1 max-w-xl">
                &quot;{userRating.feedbackText}&quot;
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setShowFeedbackInput(Boolean(userRating?.feedbackText));
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-sky-600 dark:text-cyan-400 flex items-center space-x-1.5 transition-all shadow-sm self-start sm:self-center shrink-0 min-h-[40px] active:scale-95"
            title="Edit your feedback for this topic"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Feedback</span>
          </button>
        </div>
      ) : (
        /* -------------------------------------------------------------------
         * STATE 2: INTERACTIVE FEEDBACK CONTROLS
         * Displayed when user hasn't rated yet OR has clicked "Edit Feedback"
         * ------------------------------------------------------------------- */
        <div className="space-y-4">
          
          {/* Editing Banner */}
          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 dark:bg-cyan-950/50 border border-sky-200 dark:border-cyan-800 text-xs text-sky-800 dark:text-cyan-300 font-medium animate-in fade-in">
              <span className="flex items-center space-x-1.5 font-bold">
                <Edit className="w-3.5 h-3.5" />
                <span>Editing Your Feedback</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (userRating) {
                    setVote(userRating.userVote);
                    setStarRating(userRating.starRating || 0);
                    setFeedback(userRating.feedbackText || '');
                  }
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Thumbs Up / Down Quick Buttons */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
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
                type="button"
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

            {/* 5-Star Interactive Rating: DEFAULT UNCOLORED, FILLS ON HOVER / RATE */}
            <div className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mr-1.5">
                {starRating > 0 ? `Your Rating (${starRating}★):` : 'Rate:'}
              </span>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverStar || starRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => handleStarSelect(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 dark:text-slate-600 fill-none'
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
                type="button"
                onClick={() => setShowFeedbackInput(true)}
                className="text-sky-600 dark:text-cyan-400 font-bold font-mono hover:underline flex items-center space-x-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{feedback ? 'Edit your review' : '+ Write a review for this topic'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-2 pt-2 animate-in fade-in">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your review: What did you find most helpful, or how can this lesson be improved?"
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500 placeholder:text-slate-400"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackInput(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Submit & Lock Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Community Member Reviews Section (Cross-member shared visibility) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-sky-500" />
            <span>Member Reviews ({writtenReviews.length})</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {stats.starRatingsCount > 0 ? `Avg: ${stats.avgStars.toFixed(1)} ★ from all learners` : 'No reviews yet'}
          </span>
        </div>

        {writtenReviews.length === 0 ? (
          <div className="py-4 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            No member reviews written yet. Click &quot;+ Write a review for this topic&quot; above to be the first!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {writtenReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {rev.userName || 'Member'}
                    </span>
                  </div>

                  {/* Review rating badge */}
                  <div className="flex items-center space-x-2">
                    {rev.starRating && rev.starRating > 0 ? (
                      <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.starRating!
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300 dark:text-slate-700 fill-none'
                            }`}
                          />
                        ))}
                      </div>
                    ) : rev.userVote ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {rev.userVote === 'up' ? '👍 Helpful' : '👎 Needs work'}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                  {rev.feedbackText}
                </p>

                <div className="pl-8 text-[10px] font-mono text-slate-400">
                  {new Date(rev.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
