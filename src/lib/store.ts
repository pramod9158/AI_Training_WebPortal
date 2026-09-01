'use client';

import { useState, useEffect } from 'react';
import { UserProgress, UserBadge, UserStreak, UserProfileState } from './types';
import { MODULES } from '../data/seedModules';
import { TOPICS } from '../data/seedTopics';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { checkAndHandleInactivityTimeout, recordUserActivity, signOutUser } from './supabaseAuth';

const PROGRESS_KEY = 'waynautic_user_progress';
const BADGES_KEY = 'waynautic_user_badges';
const STREAK_KEY = 'waynautic_user_streak';
const BOOKMARKS_KEY = 'waynautic_user_bookmarks';
const PROFILE_KEY = 'waynautic_user_profile';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadProfile(): UserProfileState {
  if (typeof window === 'undefined') {
    return {
      displayName: 'Guest',
      avatarUrl: '',
      selectedPath: 'path-a',
      hasCompletedOnboarding: false,
      theme: 'light'
    };
  }
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const isAuth = Boolean(parsed.userId || parsed.email);
      return {
        ...parsed,
        displayName: isAuth ? (parsed.displayName || 'Developer') : 'Guest',
        theme: parsed.theme || 'light'
      };
    } catch (e) {
      console.error('Failed to parse profile', e);
    }
  }
  return {
    displayName: 'Guest',
    avatarUrl: '',
    selectedPath: 'path-a',
    hasCompletedOnboarding: false,
    theme: 'light'
  };
}

export function resetGuestProfile() {
  if (typeof window === 'undefined') return;
  const current = loadProfile();
  const guest: UserProfileState = {
    ...current,
    userId: undefined,
    email: undefined,
    displayName: 'Guest',
    avatarUrl: '',
    lastAccessedTopicId: undefined,
    lastAccessedAt: undefined
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(guest));
  window.dispatchEvent(new Event('waynautic_storage_change'));
}

export async function saveProfile(profile: Partial<UserProfileState>) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  const current = loadProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const payload: Record<string, string | undefined> = {
          id: session.user.id,
          display_name: updated.displayName,
          avatar_url: updated.avatarUrl,
          selected_path: updated.selectedPath,
          last_accessed_topic_id: updated.lastAccessedTopicId,
          last_accessed_at: updated.lastAccessedAt
        };
        await supabase.from('user_profiles').upsert(payload);
      }
    } catch (e) {
      console.error('Failed to sync profile to Supabase', e);
    }
  }
}

export function saveLastAccessedTopic(topicId: string) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  const now = new Date().toISOString();
  saveProfile({
    lastAccessedTopicId: topicId,
    lastAccessedAt: now
  });
}

export function loadProgress(): Record<string, UserProgress> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(PROGRESS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse progress', e);
    }
  }
  return {};
}

export async function saveProgress(
  topicId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  score?: number
) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  const current = loadProgress();
  const prev = current[topicId];
  
  const updatedStatus = status;
  const updatedCompletedAt = status === 'completed' ? (prev?.completedAt || new Date().toISOString()) : undefined;
  const updatedScore = score !== undefined ? Math.max(score, prev?.score || 0) : prev?.score;

  current[topicId] = {
    topicId,
    status: updatedStatus,
    completedAt: updatedCompletedAt,
    score: updatedScore
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  await recordActivity();
  checkAndAwardBadges(current);
  saveLastAccessedTopic(topicId);
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase.from('user_progress').upsert({
          user_id: session.user.id,
          topic_id: topicId,
          status: updatedStatus,
          completed_at: updatedCompletedAt,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,topic_id' });

        if (error) {
          console.error('Supabase user_progress upsert error:', error);
        }
      }
    } catch (err) {
      console.error('Error saving progress to Supabase:', err);
    }
  }
}

export async function saveQuizAttempt(topicId: string, score: number, totalQuestions: number) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  
  // Save progress score locally
  await saveProgress(topicId, 'completed', Math.round((score / totalQuestions) * 100));

  if (isSupabaseConfigured) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('user_quiz_attempts').insert({
        user_id: session.user.id,
        topic_id: topicId,
        score,
        total_questions: totalQuestions,
        attempted_at: new Date().toISOString()
      });
    }
  }
}

export function loadStreak(): UserStreak {
  if (typeof window === 'undefined') {
    return { currentStreak: 1, longestStreak: 1, lastActiveDate: getTodayDateString() };
  }
  const saved = localStorage.getItem(STREAK_KEY);
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      if (data.lastActiveDate === today) {
        return data;
      } else if (data.lastActiveDate === yesterday) {
        return data;
      } else {
        // Inactive for more than 1 day: streak reset to 0 until next activity
        return { 
          currentStreak: 0, 
          longestStreak: Math.max(data.longestStreak || 1, data.currentStreak || 1), 
          lastActiveDate: data.lastActiveDate 
        };
      }
    } catch (e) {
      console.error('Failed to parse streak', e);
    }
  }
  const initial: UserStreak = { currentStreak: 1, longestStreak: 1, lastActiveDate: today };
  localStorage.setItem(STREAK_KEY, JSON.stringify(initial));
  return initial;
}

export async function recordActivity() {
  if (typeof window === 'undefined') return;
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const saved = localStorage.getItem(STREAK_KEY);

  let currentStreak = 1;
  let longestStreak = 1;

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      longestStreak = data.longestStreak || 1;

      if (data.lastActiveDate === today) {
        return; // Already recorded streak for today
      } else if (data.lastActiveDate === yesterday) {
        // Consecutive day activity!
        currentStreak = (data.currentStreak || 0) + 1;
      } else {
        // Streak broken, starting new streak of 1
        currentStreak = 1;
      }
      longestStreak = Math.max(currentStreak, longestStreak);
    } catch (e) {
      console.error('Failed to record activity', e);
    }
  }

  const updated: UserStreak = {
    currentStreak,
    longestStreak,
    lastActiveDate: today
  };

  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_profiles').update({
          streak_days: currentStreak,
          last_active_at: new Date().toISOString()
        }).eq('id', session.user.id);
      }
    } catch (err) {
      console.error('Error syncing streak to Supabase:', err);
    }
  }
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

export async function toggleBookmark(topicId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  recordUserActivity();
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

  if (isSupabaseConfigured) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      if (exists) {
        await supabase.from('user_bookmarks').delete().eq('user_id', session.user.id).eq('topic_id', topicId);
      } else {
        await supabase.from('user_bookmarks').insert({ user_id: session.user.id, topic_id: topicId });
      }
    }
  }

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

export async function checkAndAwardBadges(progressMap: Record<string, UserProgress>) {
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
    
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        for (const b of newBadges) {
          await supabase.from('user_badges').upsert({
            user_id: session.user.id,
            badge_type: b.badgeType,
            earned_at: b.earnedAt
          }, { onConflict: 'user_id,badge_type' });
        }
      }
    }
  }
}

export async function fetchAndSyncCloudUser(user: { id: string; email?: string }) {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return;

  try {
    // 1. Fetch User Profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      saveProfile({
        userId: user.id,
        email: user.email,
        displayName: profileData.display_name || user.email?.split('@')[0] || 'Developer',
        avatarUrl: profileData.avatar_url || '',
        selectedPath: profileData.selected_path || 'path-a',
        lastAccessedTopicId: profileData.last_accessed_topic_id || undefined,
        lastAccessedAt: profileData.last_accessed_at || undefined
      });
    } else {
      // Initialize profile if not present
      await supabase.from('user_profiles').upsert({
        id: user.id,
        display_name: user.email?.split('@')[0] || 'Developer',
        selected_path: 'path-a'
      });
      saveProfile({
        userId: user.id,
        email: user.email,
        displayName: user.email?.split('@')[0] || 'Developer'
      });
    }

    // 2. Fetch User Progress from DB
    const { data: dbProgress } = await supabase
      .from('user_progress')
      .select('topic_id, status, completed_at')
      .eq('user_id', user.id);

    if (dbProgress && dbProgress.length > 0) {
      const localProgress = loadProgress();
      const updatedProgress = { ...localProgress };

      dbProgress.forEach((item: { topic_id: string; status: 'not_started' | 'in_progress' | 'completed'; completed_at?: string }) => {
        const topicSlug = item.topic_id;
        if (topicSlug) {
          updatedProgress[topicSlug] = {
            topicId: topicSlug,
            status: item.status,
            completedAt: item.completed_at
          };
        }
      });

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));
    }

    // 3. Fetch User Bookmarks from DB
    const { data: dbBookmarks } = await supabase
      .from('user_bookmarks')
      .select('topic_id')
      .eq('user_id', user.id);

    if (dbBookmarks && dbBookmarks.length > 0) {
      const fetchedBookmarkSlugs = dbBookmarks
        .map((b: { topic_id: string }) => b.topic_id)
        .filter(Boolean);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(fetchedBookmarkSlugs));
    }

    window.dispatchEvent(new Event('waynautic_storage_change'));
  } catch (err) {
    console.error('Error syncing cloud user data:', err);
  }
}

export function useWaynauticStore() {
  const [profile, setProfileState] = useState<UserProfileState>(() => loadProfile());
  const [progress, setProgressState] = useState<Record<string, UserProgress>>(() => loadProgress());
  const [streak, setStreakState] = useState<UserStreak>(() => loadStreak());
  const [bookmarks, setBookmarksState] = useState<string[]>(() => loadBookmarks());
  const [badges, setBadgesState] = useState<UserBadge[]>(() => loadBadges());

  const reloadData = () => {
    setProfileState(loadProfile());
    setProgressState(loadProgress());
    setStreakState(loadStreak());
    setBookmarksState(loadBookmarks());
    setBadgesState(loadBadges());
  };

  useEffect(() => {
    // Record daily activity & check streak progression
    recordActivity().then(() => {
      reloadData();
    });

    // Check session expiration on mount
    checkAndHandleInactivityTimeout().then((expired) => {
      if (expired) {
        reloadData();
      }
    });

    const handleStorage = () => reloadData();
    window.addEventListener('waynautic_storage_change', handleStorage);
    window.addEventListener('storage', handleStorage);

    let authUnsubscribe: (() => void) | undefined;

    // Sync with Supabase on mount if logged in
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          resetGuestProfile();
          reloadData();
        }
      });

      authUnsubscribe = () => {
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      if (authUnsubscribe) authUnsubscribe();
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
    saveQuizAttempt,
    saveLastAccessedTopic,
    toggleBookmarkTopic: toggleBookmark,
    signOut: signOutUser,
    refresh: reloadData
  };
}
