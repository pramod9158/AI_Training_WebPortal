export type Theme = 'dark' | 'light';

export interface UserProgress {
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  score?: number;
}

export interface UserBadge {
  id: string;
  badgeType: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt: string;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  weeklyActivity?: Record<string, boolean>; // e.g. { mon: true, tue: true, ... }
}

export interface UserProfileState {
  userId?: string;
  email?: string;
  displayName: string;
  avatarUrl: string;
  avatarPreset?: string;
  selectedPath: string; // 'path-a' | 'path-b' | 'free'
  hasCompletedOnboarding: boolean;
  theme: Theme;
  role?: 'candidate' | 'admin' | 'instructor';
  plan?: 'free' | 'pro' | 'enterprise';
  accountStatus?: 'active' | 'suspended';
  streakDays?: number;
  lastActiveAt?: string;
  createdAt?: string;
  lastAccessedTopicId?: string;
  lastAccessedTab?: 'watch' | 'read' | 'quiz';
  lastAccessedAt?: string;
  lastActivityTimestamp?: number;
}

export interface TopicComment {
  id: string;
  topicId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isQuestion: boolean;
  parentId?: string;
  upvotes?: number;
  userUpvoted?: boolean;
  createdAt: string;
}

export interface TopicRating {
  id: string;
  topicId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userVote?: 'up' | 'down'; // Thumbs rating
  starRating?: number; // 1 to 5 stars
  feedbackText?: string;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'streak_warning' | 're_engagement' | 'badge_earned' | 'system';
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}


