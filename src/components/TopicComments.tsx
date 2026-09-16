'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Send, Trash2, CornerDownRight, ChevronDown, MessageCircle } from 'lucide-react';
import { loadTopicComments, fetchTopicCommentsFromDb, addTopicComment, deleteTopicComment, useWaynauticStore } from '@/lib/store';
import { TopicComment } from '@/lib/types';
import { trackCommentPosted } from '@/lib/analytics';

interface TopicCommentsProps {
  topicId: string;
  topicTitle: string;
}

export function TopicComments({ topicId, topicTitle }: TopicCommentsProps) {
  const { profile } = useWaynauticStore();
  const [comments, setComments] = useState<TopicComment[]>([]);
  const [filter, setFilter] = useState<'all' | 'questions'>('all');
  const [newContent, setNewContent] = useState('');
  const [isQuestion, setIsQuestion] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});

  const reloadComments = async () => {
    // Instant local cache render
    setComments(loadTopicComments(topicId));
    // Live database hydration from Supabase
    const liveComments = await fetchTopicCommentsFromDb(topicId);
    setComments(liveComments);
  };

  useEffect(() => {
    reloadComments();
  }, [topicId]);

  const handlePost = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = newContent.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTopicComment(topicId, content, isQuestion);
      trackCommentPosted(topicId, isQuestion);
      setNewContent('');
      setIsQuestion(false);
      await reloadComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    const content = replyContent.trim();
    if (!content || isReplying) return;

    setIsReplying(true);
    try {
      await addTopicComment(topicId, content, false, parentId);
      setReplyContent('');
      setReplyingToId(null);
      await reloadComments();
    } catch (err) {
      console.error('Error posting reply:', err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    await deleteTopicComment(topicId, commentId);
    reloadComments();
  };

  const toggleReplies = (commentId: string) => {
    setCollapsedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const filteredComments = comments.filter((c) => {
    if (filter === 'questions') return c.isQuestion;
    return true;
  });

  // Group root comments and replies
  const rootComments = filteredComments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community Q&A & Discussion</span>
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white pt-0.5 flex items-center space-x-2">
              <span>Topic Discussion Thread ({comments.length})</span>
            </h2>
          </div>
        </div>

        {/* Action Controls: Filters & Collapse Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {!isCollapsed && (
            <>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-sky-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                All ({comments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('questions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
                  filter === 'questions'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Questions ({comments.filter((c) => c.isQuestion).length})</span>
              </button>
            </>
          )}

          {/* Section Collapse / Expand Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title={isCollapsed ? 'Expand comment section' : 'Collapse comment section'}
          >
            <span>{isCollapsed ? `Show Discussions (${comments.length})` : 'Collapse'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>

      {/* Post Comment Input */}
      <form onSubmit={handlePost} className="space-y-3">
        <div className="relative">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={isQuestion ? "Ask a question about this topic..." : "Share a thought, helpful code tip, or answer..."}
            rows={3}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Question Checkbox Toggle */}
          <label className="flex items-center space-x-2 text-xs font-mono text-slate-700 dark:text-slate-300 font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isQuestion}
              onChange={(e) => setIsQuestion(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span className={isQuestion ? 'text-amber-600 dark:text-amber-400 font-extrabold' : ''}>
              Mark as Question ❓
            </span>
          </label>

          <button
            type="submit"
            disabled={!newContent.trim() || isSubmitting}
            onClick={(e) => {
              if (newContent.trim()) {
                handlePost(e);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1CB0F6] hover:bg-[#1899D6] active:scale-95 disabled:opacity-50 border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6] text-white font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[42px] touch-manipulation cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : (isQuestion ? 'Post Question' : 'Post Comment')}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {rootComments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              No discussions posted yet under this topic.
            </p>
            <p className="text-xs text-slate-500">
              Be the first to ask a question or leave a tip for your fellow learners!
            </p>
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isAuthor = comment.userName === (profile.displayName || 'Developer') || !comment.userId;

            return (
              <div
                key={comment.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-colors space-y-3 ${
                  comment.isQuestion
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-500/30'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Author Info & Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {comment.userAvatar ? (
                        <img src={comment.userAvatar} alt={comment.userName} loading="lazy" decoding="async" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        comment.userName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {comment.userName}
                        </span>
                        {comment.isQuestion && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                            QUESTION
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Delete if author) */}
                  <div className="flex items-center space-x-2">
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                  {comment.content}
                </p>

                {/* Reply Trigger & Collapsible Replies Toggle */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="text-sky-600 dark:text-cyan-400 font-bold font-mono hover:underline flex items-center space-x-1"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>

                  {replies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>{collapsedReplies[comment.id] ? `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : `Hide ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${collapsedReplies[comment.id] ? '-rotate-90' : 'rotate-0'}`} />
                    </button>
                  )}
                </div>

                {/* Inline Reply Form */}
                {replyingToId === comment.id && (
                  <div className="pl-4 border-l-2 border-sky-400 space-y-2 pt-2 animate-in fade-in">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.userName}...`}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!replyContent.trim() || isReplying}
                        onClick={() => handleReplySubmit(comment.id)}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all touch-manipulation cursor-pointer"
                      >
                        {isReplying ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Threaded Replies List (Collapsible to prevent page stretching) */}
                {replies.length > 0 && !collapsedReplies[comment.id] && (
                  <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pt-2 animate-in fade-in duration-150">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-900 dark:text-white">{reply.userName}</span>
                          <span className="font-mono text-slate-400">{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
      </>
      )}

    </div>
  );
}
