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
}

export interface UserProfileState {
  displayName: string;
  avatarUrl: string;
  selectedPath: string; // 'path-a' | 'path-b' | 'free'
  hasCompletedOnboarding: boolean;
  theme: Theme;
}
