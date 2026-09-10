'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Send, ThumbsUp, Trash2, CornerDownRight, User, AlertCircle, Sparkles } from 'lucide-react';
import { loadTopicComments, fetchTopicCommentsFromDb, addTopicComment, deleteTopicComment, toggleCommentUpvote, useWaynauticStore } from '@/lib/store';
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

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    await addTopicComment(topicId, newContent, isQuestion);
    trackCommentPosted(topicId, isQuestion);
    setNewContent('');
    setIsQuestion(false);
    reloadComments();
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    await addTopicComment(topicId, replyContent, false, parentId);
    setReplyContent('');
    setReplyingToId(null);
    reloadComments();
  };

  const handleDelete = async (commentId: string) => {
    await deleteTopicComment(topicId, commentId);
    reloadComments();
  };

  const handleUpvote = async (commentId: string) => {
    await toggleCommentUpvote(topicId, commentId);
    reloadComments();
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
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-bold flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Community Q&A & Discussion</span>
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white pt-0.5">
            Topic Discussion Thread ({comments.length})
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              filter === 'all'
                ? 'bg-sky-600 text-white dark:bg-cyan-500 dark:text-black shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Discussions ({comments.length})
          </button>
          <button
            onClick={() => setFilter('questions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1 ${
              filter === 'questions'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions Only ({comments.filter((c) => c.isQuestion).length})</span>
          </button>
        </div>
      </div>

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
              Mark as a Coding Question ❓
            </span>
          </label>

          <button
            type="submit"
            disabled={!newContent.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#1CB0F6] hover:bg-[#1899D6] disabled:opacity-50 border-2 border-[#1899D6] shadow-[0_2px_0_0_#1899D6] text-white font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[42px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isQuestion ? 'Post Question' : 'Post Comment'}</span>
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

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(comment.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        comment.userUpvoted
                          ? 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-cyan-950 dark:text-cyan-400'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-sky-400'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${comment.userUpvoted ? 'fill-sky-600 dark:fill-cyan-400' : ''}`} />
                      <span>{comment.upvotes || 0}</span>
                    </button>

                    {/* Delete if author */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
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

                {/* Reply Trigger */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="text-sky-600 dark:text-cyan-400 font-bold font-mono hover:underline flex items-center space-x-1"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Reply ({replies.length})</span>
                  </button>
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
                        onClick={() => handleReplySubmit(comment.id)}
                        className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Threaded Replies List */}
                {replies.length > 0 && (
                  <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pt-2">
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

    </div>
  );
}
