'use client';

import { useState, useEffect } from 'react';
import { UserProgress, UserBadge, UserStreak, UserProfileState } from './types';
import { MODULES } from '../data/seedModules';
import { TOPICS } from '../data/seedTopics';

const PROGRESS_KEY = 'waynautic_user_progress';
const BADGES_KEY = 'waynautic_user_badges';
const STREAK_KEY = 'waynautic_user_streak';
const BOOKMARKS_KEY = 'waynautic_user_bookmarks';
const PROFILE_KEY = 'waynautic_user_profile';

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadProfile(): UserProfileState {
  if (typeof window === 'undefined') {
    return {
      displayName: 'Developer',
      avatarUrl: '',
      selectedPath: 'path-a',
      hasCompletedOnboarding: false,
      theme: 'dark'
    };
  }
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse profile', e);
    }
  }
  return {
    displayName: 'Developer',
    avatarUrl: '',
    selectedPath: 'path-a',
    hasCompletedOnboarding: false,
    theme: 'dark'
  };
}

export function saveProfile(profile: Partial<UserProfileState>) {
  if (typeof window === 'undefined') return;
  const current = loadProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));
}

export function loadProgress(): Record<string, UserProgress> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

export function saveProgress(topicId: string, status: 'in_progress' | 'completed', score?: number) {
  if (typeof window === 'undefined') return;
  const current = loadProgress();
  const prev = current[topicId];
  
  // Update topic status
  current[topicId] = {
    topicId,
    status: status === 'completed' || prev?.status === 'completed' ? 'completed' : status,
    completedAt: status === 'completed' ? new Date().toISOString() : prev?.completedAt,
    score: score !== undefined ? Math.max(score, prev?.score || 0) : prev?.score
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  recordActivity();
  checkAndAwardBadges(current);
  window.dispatchEvent(new Event('waynautic_storage_change'));
}

export function loadStreak(): UserStreak {
  if (typeof window === 'undefined') {
    return { currentStreak: 1, longestStreak: 1, lastActiveDate: getTodayDateString() };
  }
  const saved = localStorage.getItem(STREAK_KEY);
  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      const today = getTodayDateString();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (data.lastActiveDate === today) {
        return data;
      } else if (data.lastActiveDate === yesterday) {
        return data;
      } else {
        // Streak broken if missing a day
        return { currentStreak: 0, longestStreak: data.longestStreak, lastActiveDate: data.lastActiveDate };
      }
    } catch (e) {
      console.error(e);
    }
  }
  return { currentStreak: 1, longestStreak: 1, lastActiveDate: getTodayDateString() };
}

export function recordActivity() {
  if (typeof window === 'undefined') return;
  const today = getTodayDateString();
  const streak = loadStreak();
  
  if (streak.lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newCurrent = 1;
  if (streak.lastActiveDate === yesterday) {
    newCurrent = streak.currentStreak + 1;
  }
  
  const newLongest = Math.max(newCurrent, streak.longestStreak);
  const updated: UserStreak = {
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastActiveDate: today
  };
  
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
}

export function loadBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(BOOKMARKS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function toggleBookmark(topicId: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = loadBookmarks();
  const exists = current.includes(topicId);
  let updated: string[];
  if (exists) {
    updated = current.filter(id => id !== topicId);
  } else {
    updated = [...current, topicId];
  }
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));
  return !exists;
}

export function loadBadges(): UserBadge[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(BADGES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function checkAndAwardBadges(progressMap: Record<string, UserProgress>) {
  const currentBadges = loadBadges();
  const earnedTypes = new Set(currentBadges.map(b => b.badgeType));
  const newBadges: UserBadge[] = [...currentBadges];
  const now = new Date().toISOString();

  // First Topic Badge
  const completedTopicCount = Object.values(progressMap).filter(p => p.status === 'completed').length;
  if (completedTopicCount >= 1 && !earnedTypes.has('first_step')) {
    newBadges.push({
      id: 'badge-first-step',
      badgeType: 'first_step',
      title: 'First Step',
      description: 'Completed your very first topic unit on Waynautic Academy!',
      iconName: 'Zap',
      earnedAt: now
    });
  }

  // Quiz Master Badge
  const passedQuizzes = Object.values(progressMap).filter(p => p.score && p.score >= 70).length;
  if (passedQuizzes >= 5 && !earnedTypes.has('quiz_master')) {
    newBadges.push({
      id: 'badge-quiz-master',
      badgeType: 'quiz_master',
      title: 'Quiz Master',
      description: 'Scored 70%+ on 5 different topic quizzes!',
      iconName: 'Award',
      earnedAt: now
    });
  }

  // Check per-module completion
  MODULES.forEach(mod => {
    const modTopics = TOPICS.filter(t => t.moduleSlug === mod.slug);
    const modCompleted = modTopics.every(t => progressMap[t.id]?.status === 'completed');
    const badgeType = `module_${mod.slug}`;
    if (modTopics.length > 0 && modCompleted && !earnedTypes.has(badgeType)) {
      newBadges.push({
        id: `badge-mod-${mod.slug}`,
        badgeType: badgeType,
        title: `${mod.title} Specialist`,
        description: `Mastered all topics in the ${mod.title} module!`,
        iconName: 'CheckCircle2',
        earnedAt: now
      });
    }
  });

  if (newBadges.length > currentBadges.length) {
    localStorage.setItem(BADGES_KEY, JSON.stringify(newBadges));
  }
}

export function useWaynauticStore() {
  const [profile, setProfileState] = useState<UserProfileState>(loadProfile());
  const [progress, setProgressState] = useState<Record<string, UserProgress>>({});
  const [streak, setStreakState] = useState<UserStreak>({ currentStreak: 1, longestStreak: 1, lastActiveDate: getTodayDateString() });
  const [bookmarks, setBookmarksState] = useState<string[]>([]);
  const [badges, setBadgesState] = useState<UserBadge[]>([]);

  const reloadData = () => {
    setProfileState(loadProfile());
    setProgressState(loadProgress());
    setStreakState(loadStreak());
    setBookmarksState(loadBookmarks());
    setBadgesState(loadBadges());
  };

  useEffect(() => {
    reloadData();
    const handleStorage = () => reloadData();
    window.addEventListener('waynautic_storage_change', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('waynautic_storage_change', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {
    profile,
    progress,
    streak,
    bookmarks,
    badges,
    updateProfile: saveProfile,
    markTopicProgress: saveProgress,
    toggleBookmarkTopic: toggleBookmark,
    refresh: reloadData
  };
}
