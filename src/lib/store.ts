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

export function saveLocalProfile(profile: Partial<UserProfileState>) {
  if (typeof window === 'undefined') return;
  const current = loadProfile();
  const updated = { ...current, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
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
  const yesterday = getYesterdayDateString();

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      if (!data.lastActiveDate) {
        return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', weeklyActivity: {} };
      }
      if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
        return data;
      } else {
        // Inactive for more than 1 day: streak reset to 0 until next activity
        const resetStreak: UserStreak = { 
          currentStreak: 0, 
          longestStreak: Math.max(data.longestStreak || 0, data.currentStreak || 0), 
          lastActiveDate: data.lastActiveDate,
          weeklyActivity: data.weeklyActivity || {}
        };
        localStorage.setItem(STREAK_KEY, JSON.stringify(resetStreak));
        if (isSupabaseConfigured && (data.currentStreak || 0) > 0) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              supabase.from('user_profiles').update({ streak_days: 0 }).eq('id', session.user.id).then();
            }
          }).catch(() => {});
        }
        return resetStreak;
      }
    } catch (e) {
      console.error('Failed to parse streak', e);
    }
  }
  return { currentStreak: 0, longestStreak: 0, lastActiveDate: '', weeklyActivity: {} };
}

export async function recordActivity() {
  if (typeof window === 'undefined') return;
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const saved = localStorage.getItem(STREAK_KEY);

  let currentStreak = 1;
  let longestStreak = 1;
  let weeklyActivity: Record<string, boolean> = {};

  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayKey = dayKeys[new Date().getDay()];

  if (saved) {
    try {
      const data: UserStreak = JSON.parse(saved);
      longestStreak = data.longestStreak || 1;
      weeklyActivity = data.weeklyActivity || {};

      if (data.lastActiveDate === today) {
        // Ensure today's day key is set
        weeklyActivity[currentDayKey] = true;
        const updated: UserStreak = { ...data, weeklyActivity };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        return;
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
      saveLocalProfile({
        userId: user.id,
        email: user.email || profileData.email,
        displayName: profileData.display_name || user.email?.split('@')[0] || 'Developer',
        avatarUrl: profileData.avatar_url || '',
        selectedPath: profileData.selected_path || 'path-a',
        role: profileData.role || 'candidate',
        plan: effectivePlan,
        accountStatus: profileData.account_status || 'active',
        lastAccessedTopicId: profileData.last_accessed_topic_id || undefined,
        lastAccessedTab: profileData.last_accessed_tab || undefined,
        lastAccessedAt: profileData.last_accessed_at || undefined
      });
    } else {
      // Initialize profile if not present
      await supabase.from('user_profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: user.email?.split('@')[0] || 'Developer',
        selected_path: 'path-a',
        plan: effectivePlan
      });
      saveLocalProfile({
        userId: user.id,
        email: user.email,
        displayName: user.email?.split('@')[0] || 'Developer',
        avatarUrl: '',
        selectedPath: 'path-a',
        plan: effectivePlan
      });
    }

    // 2. Fetch User Progress from DB (Strict user isolation: never merge with another user's local cache!)
    const { data: dbProgress } = await supabase
      .from('user_progress')
      .select('topic_id, status, completed_at, score')
      .eq('user_id', user.id);

    const freshProgress: Record<string, UserProgress> = {};
    if (dbProgress && dbProgress.length > 0) {
      dbProgress.forEach((item: { topic_id: string; status: 'not_started' | 'in_progress' | 'completed'; completed_at?: string; score?: number }) => {
        const topicSlug = item.topic_id;
        if (topicSlug) {
          freshProgress[topicSlug] = {
            topicId: topicSlug,
            status: item.status,
            completedAt: item.completed_at,
            score: item.score
          };
        }
      });
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(freshProgress));

    // 3. Fetch User Bookmarks from DB (Strict user isolation)
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
    const yesterdayStr = getYesterdayDateString();
    const rawActive = profileData?.last_active_at ? profileData.last_active_at.split('T')[0] : '';
    let currentStreak = profileData?.streak_days || 0;
    let isBroken = false;

    if (!rawActive || (rawActive !== todayStr && rawActive !== yesterdayStr)) {
      // Inactive for more than 1 day: streak reset to 0
      currentStreak = 0;
      isBroken = true;
    }

    const userStreak: UserStreak = {
      currentStreak,
      longestStreak: Math.max(profileData?.streak_days || 0, currentStreak),
      lastActiveDate: rawActive,
      weeklyActivity: {}
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

export function loadTopicComments(topicId: string): TopicComment[] {
  const all = loadAllTopicComments();
  return all[topicId] || [];
}

export async function fetchTopicCommentsFromDb(topicId: string): Promise<TopicComment[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('topic_comments')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: TopicComment[] = data.map((d: any) => ({
          id: d.id,
          topicId: d.topic_id,
          userId: d.user_id,
          userName: d.user_name || 'Developer',
          userAvatar: d.user_avatar || '',
          content: d.content,
          isQuestion: Boolean(d.is_question),
          parentId: d.parent_id || undefined,
          upvotes: 0,
          userUpvoted: false,
          createdAt: d.created_at
        }));

        const all = loadAllTopicComments();
        all[topicId] = mapped;
        if (typeof window !== 'undefined') {
          localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
          window.dispatchEvent(new Event('waynautic_storage_change'));
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Error fetching topic comments from Supabase:', err);
    }
  }
  return loadTopicComments(topicId);
}

export async function addTopicComment(
  topicId: string,
  content: string,
  isQuestion: boolean = false,
  parentId?: string
): Promise<TopicComment> {
  if (typeof window === 'undefined') throw new Error('Client side only');
  const profile = loadProfile();
  const newComment: TopicComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    topicId,
    userId: profile.userId,
    userName: profile.displayName || 'Developer',
    userAvatar: profile.avatarUrl,
    content: content.trim(),
    isQuestion,
    parentId,
    upvotes: 0,
    userUpvoted: false,
    createdAt: new Date().toISOString()
  };

  const all = loadAllTopicComments();
  const list = all[topicId] || [];
  all[topicId] = [newComment, ...list];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('topic_comments').insert({
          topic_id: topicId,
          user_id: session.user.id,
          user_name: profile.displayName || 'Developer',
          user_avatar: profile.avatarUrl,
          content: content.trim(),
          is_question: isQuestion,
          parent_id: parentId
        });
      }
    } catch (err) {
      console.warn('Supabase comment insert error:', err);
    }
  }

  return newComment;
}

export async function deleteTopicComment(topicId: string, commentId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const all = loadAllTopicComments();
  if (all[topicId]) {
    all[topicId] = all[topicId].filter((c) => c.id !== commentId && c.parentId !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('waynautic_storage_change'));
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('topic_comments').delete().eq('id', commentId);
    } catch (err) {
      console.warn('Supabase comment delete error:', err);
    }
  }
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
  return list.find((r) => r.userId === profile.userId) || list[0] || null;
}

export function getTopicRatingStats(topicId: string) {
  const all = loadAllTopicRatings();
  const list = all[topicId] || [];
  const totalVotes = list.length;
  const upvotes = list.filter((r) => r.userVote === 'up').length;
  const downvotes = list.filter((r) => r.userVote === 'down').length;
  const starRatings = list.map((r) => r.starRating).filter((s): s is number => typeof s === 'number');
  const avgStars = starRatings.length > 0 ? Number((starRatings.reduce((a, b) => a + b, 0) / starRatings.length).toFixed(1)) : 5.0;

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
  stats: { totalVotes: number; upvotes: number; downvotes: number; avgStars: number; starRatingsCount: number };
}> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('topic_ratings')
        .select('*')
        .eq('topic_id', topicId);

      if (!error && data) {
        const profile = loadProfile();
        const mapped: TopicRating[] = data.map((r: any) => ({
          id: r.id,
          topicId: r.topic_id,
          userId: r.user_id,
          userVote: r.vote || 'up',
          starRating: r.stars || 5,
          feedbackText: r.feedback || '',
          createdAt: r.updated_at || r.created_at || new Date().toISOString()
        }));

        const all = loadAllTopicRatings();
        all[topicId] = mapped;
        if (typeof window !== 'undefined') {
          localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
          window.dispatchEvent(new Event('waynautic_storage_change'));
        }

        const userRating = mapped.find((r) => r.userId === profile.userId) || null;
        const totalVotes = mapped.length;
        const upvotes = mapped.filter((r) => r.userVote === 'up').length;
        const downvotes = mapped.filter((r) => r.userVote === 'down').length;
        const starRatings = mapped.map((r) => r.starRating).filter((s): s is number => typeof s === 'number');
        const avgStars = starRatings.length > 0 ? Number((starRatings.reduce((a, b) => a + b, 0) / starRatings.length).toFixed(1)) : 5.0;

        return {
          userRating,
          stats: {
            totalVotes,
            upvotes,
            downvotes,
            avgStars,
            starRatingsCount: starRatings.length
          }
        };
      }
    } catch (err) {
      console.warn('Error fetching topic ratings from Supabase:', err);
    }
  }

  return {
    userRating: loadTopicUserRating(topicId),
    stats: getTopicRatingStats(topicId)
  };
}

export async function saveTopicRating(
  topicId: string,
  userVote?: 'up' | 'down',
  starRating?: number,
  feedbackText?: string
): Promise<TopicRating> {
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
    userVote: userVote !== undefined ? userVote : (existingIndex >= 0 ? list[existingIndex].userVote : 'up'),
    starRating: starRating !== undefined ? starRating : (existingIndex >= 0 ? list[existingIndex].starRating : 5),
    feedbackText: feedbackText !== undefined ? feedbackText : (existingIndex >= 0 ? list[existingIndex].feedbackText : ''),
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    list[existingIndex] = newRating;
  } else {
    list.push(newRating);
  }

  all[topicId] = list;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('waynautic_storage_change'));

  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('topic_ratings').upsert({
          topic_id: topicId,
          user_id: session.user.id,
          vote: newRating.userVote,
          stars: newRating.starRating,
          feedback: newRating.feedbackText,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,topic_id' });
      }
    } catch (err) {
      console.warn('Supabase rating upsert error:', err);
    }
  }

  return newRating;
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

    // Sync with Supabase on mount if logged in
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user);
        } else {
          // If no active session, clear any stale user metrics from previous sessions
          const current = loadProfile();
          if (!current.userId && !current.email) {
            clearAllUserData();
            reloadData();
          }
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          fetchAndSyncCloudUser(session.user);
        } else if (event === 'SIGNED_OUT') {
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
    refresh: reloadData
  };
}

