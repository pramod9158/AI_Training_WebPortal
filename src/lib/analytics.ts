import { track } from '@vercel/analytics';

/**
 * Safely track a custom Vercel Analytics event
 */
export function trackEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  try {
    track(eventName, properties);
  } catch (error) {
    console.warn(`Analytics event failed [${eventName}]:`, error);
  }
}

export function trackVideoStarted(topicTitle: string, topicId?: string) {
  trackEvent('Video Started', { topicTitle, topicId: topicId || 'unknown' });
}

export function trackTopicCompleted(topicTitle: string, topicId?: string) {
  trackEvent('Topic Completed', { topicTitle, topicId: topicId || 'unknown' });
}

export function trackQuizCompleted(topicTitle: string, scorePercent: number, topicId?: string) {
  trackEvent('Quiz Completed', { topicTitle, scorePercent, topicId: topicId || 'unknown' });
}

export function trackPdfDownloaded(title: string, type: 'topic' | 'module') {
  trackEvent('PDF Downloaded', { title, type });
}

export function trackBookmarkToggled(topicId: string, isSaved: boolean) {
  trackEvent('Bookmark Toggled', { topicId, action: isSaved ? 'saved' : 'removed' });
}

export function trackRatingSubmitted(topicId: string, ratingType: 'vote' | 'stars', value: string | number) {
  trackEvent('Rating Submitted', { topicId, ratingType, value });
}

export function trackCommentPosted(topicId: string, isQuestion: boolean) {
  trackEvent('Comment Posted', { topicId, isQuestion });
}

export function trackPaymentModalOpened() {
  trackEvent('Payment Modal Opened');
}

export function trackPaymentSubmitted(amount: number, reference: string) {
  trackEvent('Payment Submitted', { amount, reference });
}
