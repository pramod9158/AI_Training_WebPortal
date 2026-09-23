import { TopicComment } from './types';

/**
 * Robust deduplication of topic comments and discussion replies.
 * Prevents identical comments/replies from appearing twice due to
 * concurrent cloud inserts, client-server race conditions, or network retries.
 */
export function deduplicateComments(comments: TopicComment[]): TopicComment[] {
  if (!Array.isArray(comments)) return [];
  const seenIds = new Set<string>();
  const result: TopicComment[] = [];

  for (const c of comments) {
    if (!c || !c.content || !c.content.trim()) continue;

    // 1. Strict ID deduplication
    if (c.id && seenIds.has(c.id)) continue;

    const normContent = c.content.trim().toLowerCase();
    const parent = c.parentId || '';
    const authorName = (c.userName || '').trim().toLowerCase();
    const authorId = (c.userId || '').trim().toLowerCase();
    const timeMs = c.createdAt ? new Date(c.createdAt).getTime() : Date.now();

    // 2. Content + Author + Parent collision check
    const duplicateIndex = result.findIndex((existing) => {
      const existingParent = existing.parentId || '';
      if (existingParent !== parent) return false;

      const existingContent = existing.content.trim().toLowerCase();
      if (existingContent !== normContent) return false;

      const existingAuthorName = (existing.userName || '').trim().toLowerCase();
      const existingAuthorId = (existing.userId || '').trim().toLowerCase();

      // Author match check: match by username, user ID, or match if one is a default fallback
      const isAuthorMatch =
        (authorName && existingAuthorName && authorName === existingAuthorName) ||
        (authorId && existingAuthorId && authorId === existingAuthorId) ||
        (authorName && existingAuthorName && (authorName === 'learner' || existingAuthorName === 'learner')) ||
        (!authorName && !existingAuthorName);

      if (!isAuthorMatch) return false;

      // Time proximity check: within 10 minutes, or either date invalid
      const existingTimeMs = existing.createdAt ? new Date(existing.createdAt).getTime() : Date.now();
      if (isNaN(timeMs) || isNaN(existingTimeMs)) return true;
      return Math.abs(timeMs - existingTimeMs) < 10 * 60 * 1000;
    });

    if (duplicateIndex !== -1) {
      // Merge best attributes into existing
      const existing = result[duplicateIndex];
      const isExistingTemp = existing.id ? existing.id.startsWith('cmt-') : true;
      const isCurrentTemp = c.id ? c.id.startsWith('cmt-') : true;

      // Prefer real UUID over temporary ID
      if (isExistingTemp && !isCurrentTemp) {
        if (existing.id) seenIds.delete(existing.id);
        result[duplicateIndex] = {
          ...existing,
          ...c,
          isQuestion: existing.isQuestion || c.isQuestion,
          userName: c.userName || existing.userName,
          userAvatar: c.userAvatar || existing.userAvatar
        };
        if (c.id) seenIds.add(c.id);
      } else {
        // Enrich existing entry if current has better metadata
        if (!existing.userName || existing.userName === 'Learner') {
          existing.userName = c.userName || existing.userName;
        }
        if (!existing.userAvatar && c.userAvatar) {
          existing.userAvatar = c.userAvatar;
        }
        if (c.isQuestion) {
          existing.isQuestion = true;
        }
      }
      continue;
    }

    if (c.id) seenIds.add(c.id);
    result.push({ ...c });
  }

  return result;
}
