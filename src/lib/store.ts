'use client';

import { useState, useEffect } from 'react';
import { UserProgress, UserBadge, UserStreak, UserProfileState, TopicComment, TopicRating, UserNotification } from './types';
import { MODULES } from '../data/seedModules';
import { TOPICS } from '../data/seedTopics';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { checkAndHandleInactivityTimeout, recordUserActivity, signOutUser } from './supabaseAuth';

const PROGRESS_KEY = 'waynautic_user_progress';
const BADGES_KEY = 'waynautic_user_badges';
const STREAK_KEY = 'waynautic_user_streak';
const BOOKMARKS_KEY = 'waynautic_user_bookmarks';
const PROFILE_KEY = 'waynautic_user_profile';
const COMMENTS_KEY = 'waynautic_topic_comments';
const RATINGS_KEY = 'waynautic_topic_ratings';
const NOTIFICATIONS_KEY = 'waynautic_user_notifications';
export const THEME_KEY = 'waynautic_theme';

export function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    // Fallback: check profile key if previously stored there
    const profileSaved = localStorage.getItem(PROFILE_KEY);
    if (profileSaved) {
      const parsed = JSON.parse(profileSaved);
      if (parsed.theme === 'dark' || parsed.theme === 'light') {
        localStorage.setItem(THEME_KEY, parsed.theme);
        return parsed.theme;
      }
    }
  } catch (e) {
    console.warn('Error reading stored theme:', e);
  }
  return 'light';
}

export function setStoredTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
    // Apply immediately to HTML root element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Update cached profile representation
    const current = loadProfile();
    const updated = { ...current, theme };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('waynautic_storage_change'));
    window.dispatchEvent(new CustomEvent('waynautic_theme_change', { detail: theme }));
  } catch (e) {
    console.error('Failed to set stored theme:', e);
  }
}

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

export function toLocalDateString(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCalendarDayDiff(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return -1;
  const parts1 = fromDateStr.split('-').map(Number);
  const parts2 = toDateStr.split('-').map(Number);
  if (parts1.length !== 3 || parts2.length !== 3) return -1;
  const [y1, m1, d1] = parts1;
  const [y2, m2, d2] = parts2;
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return -1;
  const utcd1 = Date.UTC(y1, m1 - 1, d1);
  const utcd2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utcd2 - utcd1) / (1000 * 60 * 60 * 24));
}

export function loadProfile(): UserProfileState {
  const activeTheme = getStoredTheme();
  if (typeof window === 'undefined') {
    return {
      displayName: 'Guest',
      avatarUrl: '',
      selectedPath: 'path-a',
      hasCompletedOnboarding: false,
      theme: activeTheme
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
        theme: activeTheme
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
    theme: activeTheme
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

export function saveLocalProfile(profile: Partial<UserProfileState>) {
  if (typeof window === 'undefined') return;
  if (profile.theme) {
    setStoredTheme(profile.theme);
  }
  const current = loadProfile();
  const updated = { ...current, ...profile, theme: getStoredTheme() };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));
}

export async function saveProfile(profile: Partial<UserProfileState>) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  if (profile.theme) {
    setStoredTheme(profile.theme);
  }
  const current = loadProfile();
  const updated = { ...current, ...profile, theme: getStoredTheme() };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      let user = (await supabase.auth.getSession()).data.session?.user;
      if (!user) {
        user = (await supabase.auth.getUser()).data.user || undefined;
      }
      const targetUserId = user?.id || updated.userId || current.userId;
      if (targetUserId) {
        const avatarToSave = updated.avatarUrl?.trim() || (updated.avatarPreset ? `preset:${updated.avatarPreset}` : '');
        const payload: Record<string, string | undefined> = {
          id: targetUserId,
          display_name: updated.displayName,
          avatar_url: avatarToSave,
          selected_path: updated.selectedPath,
          last_accessed_topic_id: updated.lastAccessedTopicId,
          last_accessed_tab: updated.lastAccessedTab,
          last_accessed_at: updated.lastAccessedAt
        };
        if (updated.plan) {
          payload.plan = updated.plan;
        }
        await supabase.from('user_profiles').upsert(payload);
      }
    } catch (e) {
      console.error('Failed to sync profile to Supabase', e);
    }
  }
}

export function saveLastAccessedTopic(topicId: string, tab?: 'watch' | 'read' | 'quiz') {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  const now = new Date().toISOString();
  saveProfile({
    lastAccessedTopicId: topicId,
    lastAccessedTab: tab || 'watch',
    lastAccessedAt: now
  });
  recordActivity();
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
  score?: number,
  forceStatus?: boolean
) {
  if (typeof window === 'undefined') return;
  recordUserActivity();
  const current = loadProgress();
  const prev = current[topicId];
  
  // Protect completed topics: never downgrade from 'completed' to 'in_progress'
  // unless explicitly requested with forceStatus (such as an intentional user toggle)
  let updatedStatus = status;
  if (prev?.status === 'completed' && status === 'in_progress' && !forceStatus) {
    updatedStatus = 'completed';
  }

  const updatedCompletedAt = updatedStatus === 'completed' ? (prev?.completedAt || new Date().toISOString()) : undefined;
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
        const payload: Record<string, any> = {
          user_id: session.user.id,
          topic_id: topicId,
          status: updatedStatus,
          completed_at: updatedCompletedAt,
          updated_at: new Date().toISOString()
        };
        if (updatedScore !== undefined) {
          payload.score = updatedScore;
        }

        const { error } = await supabase.from('user_progress').upsert(payload, { onConflict: 'user_id,topic_id' });

        if (error) {
          console.warn('Supabase user_progress upsert error:', error);
          if (error.message?.includes('score')) {
            delete payload.score;
            await supabase.from('user_progress').upsert(payload, { onConflict: 'user_id,topic_id' });
          }
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
  
  const total = Math.max(totalQuestions, 1);
  const scorePercent = Math.round((score / total) * 100);
  const quizPassed = scorePercent >= 70;
  
  // Save progress: mark as completed if passed (>= 70%), otherwise in_progress
  await saveProgress(topicId, quizPassed ? 'completed' : 'in_progress', scorePercent);

  if (isSupabaseConfigured) {
    try {
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
    } catch (err) {
      console.warn('Error saving quiz attempt to Supabase:', err);
    }
  }
}

export async function fetchTopicQuizAttempts(topicId: string): Promise<Array<{ id: string; score: number; totalQuestions: number; attemptedAt: string }>> {
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_quiz_attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('topic_id', topicId)
          .order('attempted_at', { ascending: false });

        if (!error && data) {
          return data.map((a: any) => ({
            id: a.id,
            score: a.score,
            totalQuestions: a.total_questions,
            attemptedAt: a.attempted_at
          }));
        }
      }
    } catch (err) {
      console.warn('Error fetching quiz attempts from Supabase:', err);
    }
  }
  return [];
}

export function loadStreak(): UserStreak {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', weeklyActivity: {} };
  }
  const saved = localStorage.getItem(STREAK_KEY);
  const today = getTodayDateString();

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      if (!data.lastActiveDate) {
        return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', weeklyActivity: {} };
      }

      const dayDiff = getCalendarDayDiff(data.lastActiveDate, today);

      if (dayDiff === 0) {
        // Active today: ensure streak is at least 1 (self-heal any stuck 0)
        const currentStreak = Math.max(1, data.currentStreak || 1);
        const longestStreak = Math.max(currentStreak, data.longestStreak || 1);
        return { ...data, currentStreak, longestStreak };
      } else if (dayDiff === 1) {
        // Active yesterday: streak is alive at current count, waiting for today's activity
        return data;
      } else {
        // Inactive for 2 or more days: streak reset to 0 until next activity
        const resetStreak: UserStreak = { 
          currentStreak: 0, 
          longestStreak: Math.max(data.longestStreak || 0, data.currentStreak || 0), 
          lastActiveDate: data.lastActiveDate,
          weeklyActivity: data.weeklyActivity || {}
        };
        return resetStreak;
      }
    } catch (e) {
      console.error('Failed to parse streak', e);
    }
  }
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', weeklyActivity: {} };
}

export async function recordActivity(): Promise<UserStreak | undefined> {
  if (typeof window === 'undefined') return;
  const today = getTodayDateString();
  const saved = localStorage.getItem(STREAK_KEY);

  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayKey = dayKeys[new Date().getDay()];

  let currentStreak = 1;
  let longestStreak = 1;
  let weeklyActivity: Record<string, boolean> = {};

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      longestStreak = data.longestStreak || 1;
      weeklyActivity = { ...(data.weeklyActivity || {}) };

      if (data.lastActiveDate) {
        const dayDiff = getCalendarDayDiff(data.lastActiveDate, today);

        if (dayDiff === 0) {
          // Already recorded active today: ensure streak is at least 1, mark today
          currentStreak = Math.max(1, data.currentStreak || 1);
          longestStreak = Math.max(currentStreak, longestStreak);
          weeklyActivity[currentDayKey] = true;

          const updated: UserStreak = {
            ...data,
            currentStreak,
            longestStreak,
            lastActiveDate: today,
            weeklyActivity
          };
          localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
          return updated;
        } else if (dayDiff === 1) {
          // Consecutive day activity! Advance streak
          currentStreak = (data.currentStreak || 0) + 1;
          longestStreak = Math.max(currentStreak, longestStreak);
        } else {
          // Streak broken by 2+ days gap, start fresh streak of 1
          currentStreak = 1;
          longestStreak = Math.max(1, longestStreak);
        }
      } else {
        // First activity ever
        currentStreak = 1;
        longestStreak = Math.max(1, longestStreak);
      }
    } catch (e) {
      console.error('Failed to record activity', e);
    }
  }

  weeklyActivity[currentDayKey] = true;

  const updated: UserStreak = {
    currentStreak,
    longestStreak,
    lastActiveDate: today,
    weeklyActivity
  };

  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  checkAndAwardBadges(loadProgress(), updated);
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

  return updated;
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

export async function checkAndAwardBadges(
  progressMap: Record<string, UserProgress>,
  overrideStreak?: UserStreak
) {
  const currentBadges = loadBadges();
  const earnedTypes = new Set(currentBadges.map(b => b.badgeType));
  const newBadges: UserBadge[] = [...currentBadges];
  const now = new Date().toISOString();
  const currentStreakData = overrideStreak || loadStreak();

  // 1. First Topic Badge
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

  // 2. Quiz Master Badge (5 quizzes >= 70%)
  const passedQuizzes = Object.values(progressMap).filter(p => p.score !== undefined && p.score >= 70).length;
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

  // 3. Perfect Score Badge (100% on any quiz)
  const hasPerfectScore = Object.values(progressMap).some(p => p.score === 100);
  if (hasPerfectScore && !earnedTypes.has('perfect_score')) {
    newBadges.push({
      id: 'badge-perfect-score',
      badgeType: 'perfect_score',
      title: 'Flawless Mind',
      description: 'Achieved a perfect 100% score on a topic quiz!',
      iconName: 'Sparkles',
      earnedAt: now
    });
  }

  // 4. Halfway Hero (50%+ curriculum topics)
  const totalTopicCount = TOPICS.length;
  if (totalTopicCount > 0 && completedTopicCount >= Math.ceil(totalTopicCount / 2) && !earnedTypes.has('halfway_hero')) {
    newBadges.push({
      id: 'badge-halfway-hero',
      badgeType: 'halfway_hero',
      title: 'Halfway Hero',
      description: 'Completed 50% or more of the entire Waynautic Academy curriculum!',
      iconName: 'Trophy',
      earnedAt: now
    });
  }

  // 5. Curriculum Champion (100% curriculum topics)
  if (totalTopicCount > 0 && completedTopicCount === totalTopicCount && !earnedTypes.has('curriculum_champion')) {
    newBadges.push({
      id: 'badge-curriculum-champion',
      badgeType: 'curriculum_champion',
      title: 'Curriculum Champion',
      description: 'Mastered 100% of all curriculum topics and specialized AI modules!',
      iconName: 'Crown',
      earnedAt: now
    });
  }

  // 6. Streak Badges
  const maxStreak = Math.max(currentStreakData.currentStreak || 0, currentStreakData.longestStreak || 0);
  if (maxStreak >= 3 && !earnedTypes.has('streak_3')) {
    newBadges.push({
      id: 'badge-streak-3',
      badgeType: 'streak_3',
      title: 'Consistent Learner',
      description: 'Maintained a 3-day active learning streak!',
      iconName: 'Flame',
      earnedAt: now
    });
  }

  if (maxStreak >= 7 && !earnedTypes.has('streak_7')) {
    newBadges.push({
      id: 'badge-streak-7',
      badgeType: 'streak_7',
      title: 'Unstoppable Momentum',
      description: 'Maintained a 7-day active learning streak!',
      iconName: 'Flame',
      earnedAt: now
    });
  }

  // 7. Check per-module completion
  MODULES.forEach(mod => {
    const modTopics = TOPICS.filter(t => t.moduleSlug === mod.slug);
    const modCompleted = modTopics.length > 0 && modTopics.every(t => progressMap[t.id]?.status === 'completed');
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

export function clearAllUserData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
  localStorage.removeItem(BADGES_KEY);
  localStorage.removeItem(STREAK_KEY);
  resetGuestProfile();
  window.dispatchEvent(new Event('waynautic_storage_change'));
}

export async function fetchAndSyncCloudUser(user: { id: string; email?: string }) {
  if (typeof window === 'undefined' || !isSupabaseConfigured) return;

  try {
    // 1. Fetch User Profile from Supabase
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Check if user has an approved payment in Supabase payments ledger
    let hasApprovedPayment = false;
    try {
      let payQuery = supabase
        .from('payments')
        .select('id, status')
        .eq('status', 'verified');
      
      if (user.id && user.email) {
        payQuery = payQuery.or(`user_id.eq.${user.id},user_email.ilike.${user.email}`);
      } else if (user.id) {
        payQuery = payQuery.eq('user_id', user.id);
      } else if (user.email) {
        payQuery = payQuery.ilike('user_email', user.email);
      }
      const { data: payRows } = await payQuery.limit(1);
      hasApprovedPayment = Boolean(payRows && payRows.length > 0);
    } catch (pErr) {
      console.warn('Payment check query error in fetchAndSyncCloudUser:', pErr);
    }

    const effectivePlan: 'free' | 'pro' | 'enterprise' = 
      (profileData?.plan === 'enterprise') 
        ? 'enterprise' 
        : (profileData?.plan === 'pro' || hasApprovedPayment) 
        ? 'pro' 
        : 'free';

    // If approved payment exists in payments table but user_profiles.plan was still 'free', self-heal and update DB
    if (hasApprovedPayment && profileData?.plan !== 'pro' && profileData?.plan !== 'enterprise') {
      try {
        await supabase.from('user_profiles').update({ plan: 'pro' }).eq('id', user.id);
      } catch (uErr) {
        console.warn('Failed to self-heal user plan in Supabase:', uErr);
      }
    }

    if (profileData) {
      let avatarUrl = '';
      let avatarPreset = 'ai-architect';

      if (profileData.avatar_url) {
        if (profileData.avatar_url.startsWith('preset:')) {
          avatarPreset = profileData.avatar_url.replace('preset:', '');
          avatarUrl = '';
        } else {
          avatarUrl = profileData.avatar_url;
          avatarPreset = 'ai-architect';
        }
      }

      const activeTheme = getStoredTheme();
      const dbProfileState: UserProfileState = {
        userId: user.id,
        email: user.email || profileData.email,
        displayName: profileData.display_name || user.email?.split('@')[0] || 'Developer',
        avatarUrl,
        avatarPreset,
        selectedPath: profileData.selected_path || 'path-a',
        role: profileData.role || 'candidate',
        plan: effectivePlan,
        accountStatus: profileData.account_status || 'active',
        lastAccessedTopicId: profileData.last_accessed_topic_id || undefined,
        lastAccessedTab: profileData.last_accessed_tab || undefined,
        lastAccessedAt: profileData.last_accessed_at || undefined,
        hasCompletedOnboarding: true,
        theme: activeTheme
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(dbProfileState));
      // Eagerly notify components immediately when profile data arrives
      window.dispatchEvent(new Event('waynautic_storage_change'));
    } else {
      // Initialize profile if not present
      await supabase.from('user_profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: user.email?.split('@')[0] || 'Developer',
        selected_path: 'path-a',
        plan: effectivePlan
      });
      const initialProfile: UserProfileState = {
        userId: user.id,
        email: user.email,
        displayName: user.email?.split('@')[0] || 'Developer',
        avatarUrl: '',
        selectedPath: 'path-a',
        plan: effectivePlan,
        hasCompletedOnboarding: true,
        theme: getStoredTheme()
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(initialProfile));
    }

    // 2. Fetch User Progress directly from DB (DB is the 100% authoritative single source of truth - NO stale cache pollution)
    const { data: dbProgress, error: progressErr } = await supabase
      .from('user_progress')
      .select('topic_id, status, completed_at, score')
      .eq('user_id', user.id);

    if (!progressErr && dbProgress) {
      const freshProgress: Record<string, UserProgress> = {};

      dbProgress.forEach((item: { topic_id: string; status: 'not_started' | 'in_progress' | 'completed'; completed_at?: string; score?: number }) => {
        const topicSlug = item.topic_id;
        if (topicSlug) {
          freshProgress[topicSlug] = {
            topicId: topicSlug,
            status: item.status,
            completedAt: item.completed_at,
            score: item.score !== undefined && item.score !== null ? Number(item.score) : undefined
          };
        }
      });

      localStorage.setItem(PROGRESS_KEY, JSON.stringify(freshProgress));
    }

    // 3. Fetch User Bookmarks from DB (Strict DB truth)
    const { data: dbBookmarks } = await supabase
      .from('user_bookmarks')
      .select('topic_id')
      .eq('user_id', user.id);

    const freshBookmarks = (dbBookmarks && dbBookmarks.length > 0)
      ? dbBookmarks.map((b: { topic_id: string }) => b.topic_id).filter(Boolean)
      : [];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(freshBookmarks));

    // 4. Fetch User Badges from DB (Strict user isolation)
    const { data: dbBadges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);

    const freshBadges: UserBadge[] = (dbBadges && dbBadges.length > 0)
      ? dbBadges.map((b: { id?: string; badge_type: string; earned_at?: string }) => ({
          id: b.id || `badge-${b.badge_type}`,
          badgeType: b.badge_type,
          title: b.badge_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: 'Milestone milestone unlocked on Waynautic Academy!',
          iconName: 'Award',
          earnedAt: b.earned_at || new Date().toISOString()
        }))
      : [];
    localStorage.setItem(BADGES_KEY, JSON.stringify(freshBadges));

    // 5. User Streak from profile (Strict user isolation & automatic inactivity reset)
    const todayStr = getTodayDateString();
    const existingLocal = loadStreak();
    const dbLocalDate = toLocalDateString(profileData?.last_active_at);

    // Pick the most recent active date between local store and DB
    const effectiveActiveDate = (dbLocalDate && (!existingLocal.lastActiveDate || dbLocalDate >= existingLocal.lastActiveDate))
      ? dbLocalDate
      : (existingLocal.lastActiveDate || dbLocalDate || '');

    const dayDiff = effectiveActiveDate ? getCalendarDayDiff(effectiveActiveDate, todayStr) : -1;
    let currentStreak = Math.max(profileData?.streak_days || 0, existingLocal.currentStreak || 0);
    let longestStreak = Math.max(profileData?.streak_days || 0, existingLocal.longestStreak || 0, currentStreak);
    let isBroken = false;

    if (dayDiff === 0) {
      // Active today: ensure streak is at least 1
      currentStreak = Math.max(1, currentStreak);
    } else if (dayDiff === 1) {
      // Active yesterday: streak is alive at current count (at risk until activity today)
      currentStreak = Math.max(1, currentStreak);
    } else if (dayDiff > 1) {
      // Inactive for 2 or more days: streak reset to 0
      currentStreak = 0;
      isBroken = true;
    }

    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayKey = dayKeys[new Date().getDay()];
    const weeklyActivity = { ...(existingLocal.weeklyActivity || {}) };
    if (dayDiff === 0) {
      weeklyActivity[currentDayKey] = true;
    }

    const userStreak: UserStreak = {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastActiveDate: effectiveActiveDate,
      weeklyActivity
    };
    localStorage.setItem(STREAK_KEY, JSON.stringify(userStreak));

    // If streak was broken due to inactivity, update Supabase DB to 0 as well
    if (isBroken && profileData?.streak_days && profileData.streak_days > 0) {
      try {
        await supabase.from('user_profiles').update({ streak_days: 0 }).eq('id', user.id);
      } catch (sErr) {
        console.warn('Could not reset broken streak in Supabase:', sErr);
      }
    }

    // 6. Fetch User Notifications from DB
    const { data: dbNotifications } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbNotifications && dbNotifications.length > 0) {
      const freshNotifications: UserNotification[] = dbNotifications.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        type: n.type,
        linkUrl: n.link_url,
        isRead: Boolean(n.is_read),
        createdAt: n.created_at
      }));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(freshNotifications));
    }

    window.dispatchEvent(new Event('waynautic_storage_change'));

    window.dispatchEvent(new Event('waynautic_storage_change'));
  } catch (err) {
    console.error('Error syncing cloud user data:', err);
  }
}

export function loadAllTopicComments(): Record<string, TopicComment[]> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(COMMENTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse topic comments', e);
    }
  }
  return {};
}

import { deduplicateComments } from './commentUtils';
export { deduplicateComments };


export function loadTopicComments(topicId: string): TopicComment[] {
  const all = loadAllTopicComments();
  return deduplicateComments(all[topicId] || []);
}

export async function fetchTopicCommentsFromDb(topicId: string): Promise<TopicComment[]> {
  let dbComments: TopicComment[] = [];

  // 1. Fetch from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('topic_comments')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Look up user_profiles to enrich missing display names or avatars
        const userIds = Array.from(new Set(data.map((d: any) => d.user_id).filter(Boolean)));
        let profileMap = new Map<string, { display_name?: string; avatar_url?: string }>();
        if (userIds.length > 0) {
          try {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);
            if (profiles) {
              profiles.forEach((p: any) => profileMap.set(p.id, p));
            }
          } catch {}
        }

        dbComments = data.map((d: any) => {
          const prof = profileMap.get(d.user_id);
          return {
            id: d.id,
            topicId: d.topic_id,
            userId: d.user_id,
            userName: d.user_name || prof?.display_name || 'Learner',
            userAvatar: d.user_avatar || prof?.avatar_url || '',
            content: d.content,
            isQuestion: Boolean(d.is_question),
            parentId: d.parent_id || undefined,
            upvotes: 0,
            userUpvoted: false,
            createdAt: d.created_at
          };
        });
      }
    } catch (err) {
      console.warn('Error fetching topic comments from Supabase:', err);
    }
  }

  // 2. Query /api/comments for server-cached cross-user comments
  let apiComments: TopicComment[] = [];
  try {
    const res = await fetch(`/api/comments?topicId=${encodeURIComponent(topicId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.comments)) {
        apiComments = json.comments;
      }
    }
  } catch (err) {
    console.warn('Could not fetch comments from /api/comments:', err);
  }

  const all = loadAllTopicComments();
  const localList = all[topicId] || [];
  const pendingLocal = localList.filter((c) => c.id.startsWith('cmt-'));

  const rawList = [...dbComments, ...apiComments, ...pendingLocal].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const finalList = deduplicateComments(rawList);

  all[topicId] = finalList;
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  }
  return finalList;
}

export async function addTopicComment(
  topicId: string,
  content: string,
  isQuestion: boolean = false,
  parentId?: string
): Promise<TopicComment> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const profile = loadProfile();
  const trimmed = content.trim();
  const tempId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  let realCommentId = tempId;
  let alreadyInsertedInDb = false;

  const newComment: TopicComment = {
    id: tempId,
    topicId,
    userId: profile.userId,
    userName: profile.displayName || 'Learner',
    userAvatar: profile.avatarUrl || '',
    content: trimmed,
    isQuestion,
    parentId: parentId || undefined,
    upvotes: 0,
    userUpvoted: false,
    createdAt: new Date().toISOString()
  };

  const all = loadAllTopicComments();
  const list = all[topicId] || [];
  all[topicId] = deduplicateComments([newComment, ...list]);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  recordActivity();

  // 1. Direct Supabase cloud insert if user is connected
  let sessionToken: string | undefined;
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token;
      let user = session?.user;
      if (!user) {
        user = (await supabase.auth.getUser()).data.user || undefined;
      }

      if (user) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parentId || '');
        const payload: any = {
          topic_id: topicId,
          user_id: user.id,
          user_name: profile.displayName || user.user_metadata?.full_name || 'Learner',
          user_avatar: profile.avatarUrl || user.user_metadata?.avatar_url || '',
          content: trimmed,
          is_question: isQuestion,
        };
        if (isUuid && parentId) {
          payload.parent_id = parentId;
        }

        const { data: inserted, error } = await supabase
          .from('topic_comments')
          .insert(payload)
          .select()
          .single();

        if (!error && inserted?.id) {
          realCommentId = inserted.id;
          newComment.id = realCommentId;
          alreadyInsertedInDb = true;

          // Update local cache with real UUID
          const currentList = (all[topicId] || []).map((c) => (c.id === tempId ? { ...c, id: realCommentId } : c));
          all[topicId] = deduplicateComments(currentList);
          localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
        } else if (error) {
          console.warn('Supabase comment insert warning:', error);
        }
      }
    } catch (err) {
      console.warn('Supabase comment insert error:', err);
    }
  }

  // 2. Post to /api/comments for server file cache (mark alreadyInsertedInDb so the server does NOT re-insert into Supabase!)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        topicId,
        userId: profile.userId,
        userName: profile.displayName || 'Learner',
        userAvatar: profile.avatarUrl || '',
        content: trimmed,
        isQuestion,
        parentId,
        id: realCommentId,
        alreadyInsertedInDb
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.comments)) {
        all[topicId] = deduplicateComments(json.comments);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
      }
    }
  } catch (err) {
    console.warn('Failed to sync comment to /api/comments:', err);
  }

  window.dispatchEvent(new Event('waynautic_storage_change'));
  return newComment;
}

export async function deleteTopicComment(topicId: string, commentId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const all = loadAllTopicComments();
  const targetComment = (all[topicId] || []).find((c) => c.id === commentId);

  if (all[topicId]) {
    all[topicId] = all[topicId].filter((c) => {
      if (c.id === commentId || c.parentId === commentId) return false;
      if (
        targetComment &&
        c.content.trim() === targetComment.content.trim() &&
        (c.parentId || '') === (targetComment.parentId || '') &&
        (c.userName === targetComment.userName || c.userId === targetComment.userId)
      ) {
        return false;
      }
      return true;
    });
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('waynautic_storage_change'));
  }

  if (isSupabaseConfigured) {
    try {
      if (/^[0-9a-fA-F-]{36}$/.test(commentId)) {
        await supabase.from('topic_comments').delete().eq('id', commentId);
      }
      if (targetComment?.content && targetComment?.userId && /^[0-9a-fA-F-]{36}$/.test(targetComment.userId)) {
        await supabase
          .from('topic_comments')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', targetComment.userId)
          .eq('content', targetComment.content.trim());
      }
    } catch (err) {
      console.warn('Supabase comment delete error:', err);
    }
  }

  try {
    await fetch(`/api/comments?topicId=${encodeURIComponent(topicId)}&commentId=${encodeURIComponent(commentId)}`, {
      method: 'DELETE'
    });
  } catch {}
}

export async function toggleCommentUpvote(topicId: string, commentId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const all = loadAllTopicComments();
  if (all[topicId]) {
    all[topicId] = all[topicId].map((c) => {
      if (c.id === commentId) {
        const userUpvoted = !c.userUpvoted;
        const upvotes = (c.upvotes || 0) + (userUpvoted ? 1 : -1);
        return { ...c, userUpvoted, upvotes: Math.max(0, upvotes) };
      }
      return c;
    });
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('waynautic_storage_change'));
  }
}

export function loadAllTopicRatings(): Record<string, TopicRating[]> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(RATINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse topic ratings', e);
    }
  }
  return {};
}

export function loadTopicUserRating(topicId: string): TopicRating | null {
  const all = loadAllTopicRatings();
  const list = all[topicId] || [];
  const profile = loadProfile();
  return list.find((r) => r.userId === profile.userId) || null;
}

export function getTopicRatingStats(topicId: string) {
  const all = loadAllTopicRatings();
  const list = all[topicId] || [];
  const upvotes = list.filter((r) => r.userVote === 'up').length;
  const downvotes = list.filter((r) => r.userVote === 'down').length;
  const totalVotes = upvotes + downvotes;
  const starRatings = list
    .map((r) => r.starRating)
    .filter((s): s is number => typeof s === 'number' && s > 0);
  const avgStars = starRatings.length > 0
    ? Number((starRatings.reduce((a, b) => a + b, 0) / starRatings.length).toFixed(1))
    : 0;

  return {
    totalVotes,
    upvotes,
    downvotes,
    avgStars,
    starRatingsCount: starRatings.length
  };
}

export async function fetchTopicRatingsFromDb(topicId: string): Promise<{
  userRating: TopicRating | null;
  ratings: TopicRating[];
  stats: { totalVotes: number; upvotes: number; downvotes: number; avgStars: number; starRatingsCount: number };
}> {
  let dbRatings: TopicRating[] = [];

  // 1. Fetch from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('topic_ratings')
        .select('*')
        .eq('topic_id', topicId);

      if (!error && data && data.length > 0) {
        // Look up user_profiles to enrich with author display names and avatars
        const userIds = Array.from(new Set(data.map((r: any) => r.user_id).filter(Boolean)));
        let profileMap = new Map<string, { display_name?: string; avatar_url?: string }>();
        if (userIds.length > 0) {
          try {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('id, display_name, avatar_url')
              .in('id', userIds);
            if (profiles) {
              profiles.forEach((p: any) => profileMap.set(p.id, p));
            }
          } catch (pErr) {
            console.warn('Could not query user_profiles in fetchTopicRatingsFromDb:', pErr);
          }
        }

        const all = loadAllTopicRatings();
        const currentList = all[topicId] || [];

        dbRatings = data.map((row: any) => {
          const prof = profileMap.get(row.user_id);
          const localMatch = currentList.find((l) => l.userId === row.user_id);
          return {
            id: row.id || `db-${row.user_id}-${row.topic_id}`,
            topicId: row.topic_id,
            userId: row.user_id,
            userName: prof?.display_name || row.user_name || localMatch?.userName || 'Member',
            userAvatar: prof?.avatar_url || row.user_avatar || localMatch?.userAvatar || '',
            userVote: row.vote || undefined,
            starRating: row.stars || undefined,
            feedbackText: row.feedback || '',
            createdAt: row.updated_at || row.created_at || new Date().toISOString()
          };
        });
      }
    } catch (err) {
      console.warn('Supabase ratings fetch error:', err);
    }
  }

  // 2. Fetch from /api/ratings to merge server-cached reviews
  let apiRatings: TopicRating[] = [];
  try {
    const res = await fetch(`/api/ratings?topicId=${encodeURIComponent(topicId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.ratings)) {
        apiRatings = json.ratings;
      }
    }
  } catch (err) {
    console.warn('Could not fetch ratings from /api/ratings:', err);
  }

  // Merge dbRatings and apiRatings cleanly by userId / id
  const mergedMap = new Map<string, TopicRating>();
  apiRatings.forEach((r) => {
    const key = r.userId || r.id;
    mergedMap.set(key, r);
  });
  dbRatings.forEach((r) => {
    const key = r.userId || r.id;
    const existing = mergedMap.get(key);
    mergedMap.set(key, {
      ...r,
      userName: r.userName !== 'Member' ? r.userName : (existing?.userName || r.userName),
      userAvatar: r.userAvatar || existing?.userAvatar || ''
    });
  });

  const merged = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const all = loadAllTopicRatings();
  all[topicId] = merged;
  if (typeof window !== 'undefined') {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('waynautic_storage_change'));
  }

  const profile = loadProfile();
  const userRating = merged.find((r) => r.userId === profile.userId) || null;
  const stats = getTopicRatingStats(topicId);

  return {
    userRating,
    ratings: merged,
    stats
  };
}

export async function saveTopicRating(
  topicId: string,
  userVote?: 'up' | 'down',
  starRating?: number,
  feedbackText?: string
): Promise<{
  rating: TopicRating;
  ratings: TopicRating[];
  stats: { totalVotes: number; upvotes: number; downvotes: number; avgStars: number; starRatingsCount: number };
}> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  recordUserActivity();
  const profile = loadProfile();
  const all = loadAllTopicRatings();
  const list = all[topicId] || [];
  const existingIndex = list.findIndex((r) => r.userId === profile.userId);

  const newRating: TopicRating = {
    id: existingIndex >= 0 ? list[existingIndex].id : `rat-${Date.now()}`,
    topicId,
    userId: profile.userId,
    userName: profile.displayName || 'Member',
    userAvatar: profile.avatarUrl || '',
    userVote: userVote !== undefined ? userVote : (existingIndex >= 0 ? list[existingIndex].userVote : undefined),
    starRating: starRating !== undefined ? starRating : (existingIndex >= 0 ? list[existingIndex].starRating : undefined),
    feedbackText: feedbackText !== undefined ? feedbackText : (existingIndex >= 0 ? list[existingIndex].feedbackText : ''),
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    list[existingIndex] = newRating;
  } else {
    list.unshift(newRating);
  }

  all[topicId] = list;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  // 1. Direct Supabase cloud persistence with authenticated user session
  let sessionToken: string | undefined;
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token;
      let user = session?.user;
      if (!user) {
        user = (await supabase.auth.getUser()).data.user || undefined;
      }
      if (user) {
        const payload: any = {
          topic_id: topicId,
          user_id: user.id,
          vote: newRating.userVote || null,
          stars: newRating.starRating || null,
          feedback: newRating.feedbackText || '',
          updated_at: new Date().toISOString()
        };
        if (newRating.userName) payload.user_name = newRating.userName;
        if (newRating.userAvatar) payload.user_avatar = newRating.userAvatar;

        const { error } = await supabase.from('topic_ratings').upsert(payload, { onConflict: 'user_id,topic_id' });
        if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
          delete payload.user_name;
          delete payload.user_avatar;
          await supabase.from('topic_ratings').upsert(payload, { onConflict: 'user_id,topic_id' });
        }
      }
    } catch (err) {
      console.warn('Direct Supabase rating upsert error:', err);
    }
  }

  // 2. Post to server API for universal cross-member visibility
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        topicId,
        userId: profile.userId,
        userName: profile.displayName || 'Member',
        userAvatar: profile.avatarUrl || '',
        userVote: newRating.userVote,
        starRating: newRating.starRating,
        feedbackText: newRating.feedbackText
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.ratings)) {
        all[topicId] = data.ratings;
        localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
        window.dispatchEvent(new Event('waynautic_storage_change'));
        return {
          rating: data.rating || newRating,
          ratings: data.ratings,
          stats: data.stats || getTopicRatingStats(topicId)
        };
      }
    }
  } catch (err) {
    console.warn('Failed to sync rating to server:', err);
  }

  return {
    rating: newRating,
    ratings: list,
    stats: getTopicRatingStats(topicId)
  };
}

export function loadUserNotifications(): UserNotification[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(NOTIFICATIONS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse notifications', e);
    }
  }
  const defaultNudge: UserNotification = {
    id: 'nudge-welcome',
    title: 'Welcome to Waynautic Academy! 🚀',
    message: 'Start your daily learning streak today by completing your first topic lesson.',
    type: 'system',
    linkUrl: '/curriculum/intro-ai/t-1?tab=watch',
    isRead: false,
    createdAt: new Date().toISOString()
  };
  return [defaultNudge];
}

export async function fetchUserNotificationsFromDb(): Promise<UserNotification[]> {
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const freshNotifications: UserNotification[] = data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            linkUrl: n.link_url,
            isRead: Boolean(n.is_read),
            createdAt: n.created_at
          }));
          localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(freshNotifications));
          window.dispatchEvent(new Event('waynautic_storage_change'));
          return freshNotifications;
        }
      }
    } catch (err) {
      console.warn('Error fetching notifications from Supabase:', err);
    }
  }
  return loadUserNotifications();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const list = loadUserNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.warn('Error syncing notification read status to Supabase:', err);
    }
  }
}

export async function sendNudgeNotification(
  title: string,
  message: string,
  type: 'streak_warning' | 're_engagement' | 'badge_earned' | 'system',
  linkUrl: string
): Promise<UserNotification> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const profile = loadProfile();
  const newNudge: UserNotification = {
    id: `nudge-${Date.now()}`,
    userId: profile.userId,
    title,
    message,
    type,
    linkUrl,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const list = loadUserNotifications();
  const updated = [newNudge, ...list];
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_notifications').insert({
          user_id: session.user.id,
          title,
          message,
          type,
          link_url: linkUrl
        });
      }
    } catch (err) {
      console.warn('Supabase notification insert error:', err);
    }
  }

  return newNudge;
}

// =========================================================================
// Realtime Sync Manager (Singleton per active user session)
// =========================================================================
let globalRealtimeChannel: any = null;
let activeRealtimeUserId: string | null = null;
let realtimeChannelCounter = 0;

export function ensureRealtimeSync(userId: string, email?: string) {
  if (!isSupabaseConfigured || typeof window === 'undefined' || !userId) return;

  // Already subscribed for this active user session
  if (activeRealtimeUserId === userId && globalRealtimeChannel) {
    return;
  }

  // If switched user or replacing channel, cleanly remove prior channel
  if (globalRealtimeChannel) {
    try {
      supabase.removeChannel(globalRealtimeChannel);
    } catch (err) {
      console.warn('Error removing prior realtime channel:', err);
    }
    globalRealtimeChannel = null;
    activeRealtimeUserId = null;
  }

  activeRealtimeUserId = userId;
  realtimeChannelCounter += 1;
  const channelName = `user_sync_${userId}_${Date.now()}_${realtimeChannelCounter}`;

  try {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${userId}` },
        () => {
          fetchAndSyncCloudUser({ id: userId, email });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress', filter: `user_id=eq.${userId}` },
        () => {
          fetchAndSyncCloudUser({ id: userId, email });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_bookmarks', filter: `user_id=eq.${userId}` },
        () => {
          fetchAndSyncCloudUser({ id: userId, email });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${userId}` },
        () => {
          fetchAndSyncCloudUser({ id: userId, email });
        }
      );

    channel.subscribe();
    globalRealtimeChannel = channel;
  } catch (err) {
    console.error('Failed to setup realtime sync channel:', err);
  }
}

export function cleanupRealtimeSync() {
  if (globalRealtimeChannel) {
    try {
      supabase.removeChannel(globalRealtimeChannel);
    } catch (err) {
      console.warn('Error cleaning up realtime channel:', err);
    }
    globalRealtimeChannel = null;
    activeRealtimeUserId = null;
  }
}

export function useWaynauticStore() {
  const [profile, setProfileState] = useState<UserProfileState>(() => loadProfile());
  const [progress, setProgressState] = useState<Record<string, UserProgress>>(() => loadProgress());
  const [streak, setStreakState] = useState<UserStreak>(() => loadStreak());
  const [bookmarks, setBookmarksState] = useState<string[]>(() => loadBookmarks());
  const [badges, setBadgesState] = useState<UserBadge[]>(() => loadBadges());
  const [notifications, setNotificationsState] = useState<UserNotification[]>(() => loadUserNotifications());

  const reloadData = () => {
    setProfileState(loadProfile());
    setProgressState(loadProgress());
    setStreakState(loadStreak());
    setBookmarksState(loadBookmarks());
    setBadgesState(loadBadges());
    setNotificationsState(loadUserNotifications());
  };

  useEffect(() => {
    // Check session expiration on mount
    checkAndHandleInactivityTimeout().then((expired) => {
      if (expired) {
        clearAllUserData();
        reloadData();
      }
    });

    const handleStorage = () => reloadData();
    window.addEventListener('waynautic_storage_change', handleStorage);
    window.addEventListener('storage', handleStorage);

    let authUnsubscribe: (() => void) | undefined;

    // Eager instant sync on hard refresh / mount:
    const cachedProfile = loadProfile();
    if (cachedProfile.userId && isSupabaseConfigured) {
      fetchAndSyncCloudUser({ id: cachedProfile.userId, email: cachedProfile.email }).then(() => {
        recordActivity();
      });
      ensureRealtimeSync(cachedProfile.userId, cachedProfile.email);
    } else {
      recordActivity();
    }

    // Sync with Supabase on mount if logged in
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user).then(() => {
            recordActivity();
          });
          ensureRealtimeSync(session.user.id, session.user.email);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user).then(() => {
            recordActivity();
          });
          ensureRealtimeSync(session.user.id, session.user.email);
        } else if (event === 'SIGNED_OUT') {
          cleanupRealtimeSync();
          clearAllUserData();
          reloadData();
        }
      });

      authUnsubscribe = () => {
        authListener.subscription.unsubscribe();
      };
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isSupabaseConfigured) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            fetchAndSyncCloudUser(session.user);
          }
        });
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      window.removeEventListener('waynautic_storage_change', handleStorage);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  return {
    profile,
    progress,
    streak,
    bookmarks,
    badges,
    notifications,
    updateProfile: saveProfile,
    markTopicProgress: saveProgress,
    saveQuizAttempt,
    saveLastAccessedTopic,
    toggleBookmarkTopic: toggleBookmark,
    addTopicComment,
    deleteTopicComment,
    toggleCommentUpvote,
    saveTopicRating,
    markNotificationRead,
    sendNudgeNotification,
    signOut: signOutUser,
    setTheme: setStoredTheme,
    refresh: reloadData
  };
}

