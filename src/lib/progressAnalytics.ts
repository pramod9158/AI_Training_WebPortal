import { MODULES, Module } from '@/data/seedModules';
import { Topic } from '@/data/seedTopics';
import { getAllTopics } from './curriculumService';
import { UserProgress, UserStreak, UserBadge } from './types';

export interface BadgeCatalogItem {
  id: string;
  badgeType: string;
  title: string;
  description: string;
  category: 'Milestones' | 'Quizzes' | 'Modules' | 'Streaks';
  iconName: string;
  requirementText: string;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  isUnlocked: boolean;
  earnedAt?: string;
}

export interface ModuleProgressStats {
  module: Module;
  topics: Topic[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  progressPercent: number;
  averageQuizScore: number | null;
  quizzesAttempted: number;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface OverallProgressStats {
  totalTopics: number;
  completedTopics: number;
  overallPercent: number;
  totalQuizzesAttempted: number;
  quizzesPassed: number; // >= 70%
  perfectQuizzes: number; // 100%
  averageQuizScore: number | null;
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
  masteryTier: {
    name: string;
    level: number;
    color: string;
    nextTier?: string;
    topicsToNextTier?: number;
  };
}

export function computeOverallStats(
  progress: Record<string, UserProgress>,
  topicsList?: Topic[]
): OverallProgressStats {
  const currentTopics = topicsList || getAllTopics();
  const totalTopics = currentTopics.length;
  const progressList = Object.values(progress);
  
  const completedTopics = progressList.filter(p => p.status === 'completed').length;
  const overallPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const quizScores = progressList
    .map(p => p.score)
    .filter((s): s is number => typeof s === 'number' && !isNaN(s));

  const totalQuizzesAttempted = quizScores.length;
  const quizzesPassed = quizScores.filter(s => s >= 70).length;
  const perfectQuizzes = quizScores.filter(s => s === 100).length;
  const averageQuizScore = totalQuizzesAttempted > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / totalQuizzesAttempted)
    : null;

  const totalEstimatedMinutes = currentTopics.reduce((acc, t) => acc + (t.estimatedMinutes || 20), 0);
  const completedEstimatedMinutes = currentTopics
    .filter(t => progress[t.id]?.status === 'completed')
    .reduce((acc, t) => acc + (t.estimatedMinutes || 20), 0);

  // Mastery tier evaluation
  let masteryTier: OverallProgressStats['masteryTier'];
  if (overallPercent === 100) {
    masteryTier = { name: 'Master AI Architect', level: 5, color: 'text-amber-500' };
  } else if (overallPercent >= 75) {
    const remaining = totalTopics - completedTopics;
    masteryTier = { name: 'AI Specialist', level: 4, color: 'text-purple-500', nextTier: 'Master AI Architect', topicsToNextTier: remaining };
  } else if (overallPercent >= 50) {
    const needed = Math.ceil(totalTopics * 0.75) - completedTopics;
    masteryTier = { name: 'AI Practitioner', level: 3, color: 'text-cyan-500', nextTier: 'AI Specialist', topicsToNextTier: Math.max(1, needed) };
  } else if (overallPercent >= 20) {
    const needed = Math.ceil(totalTopics * 0.5) - completedTopics;
    masteryTier = { name: 'AI Explorer', level: 2, color: 'text-emerald-500', nextTier: 'AI Practitioner', topicsToNextTier: Math.max(1, needed) };
  } else {
    const needed = Math.ceil(totalTopics * 0.2) - completedTopics;
    masteryTier = { name: 'AI Apprentice', level: 1, color: 'text-sky-500', nextTier: 'AI Explorer', topicsToNextTier: Math.max(1, needed) };
  }

  return {
    totalTopics,
    completedTopics,
    overallPercent,
    totalQuizzesAttempted,
    quizzesPassed,
    perfectQuizzes,
    averageQuizScore,
    totalEstimatedMinutes,
    completedEstimatedMinutes,
    masteryTier
  };
}

export function computeModuleProgressStats(
  progress: Record<string, UserProgress>,
  topicsList?: Topic[]
): ModuleProgressStats[] {
  const currentTopics = topicsList || getAllTopics();
  return MODULES.map(mod => {
    const modTopics = currentTopics.filter(t => t.moduleSlug === mod.slug);
    const totalTopics = modTopics.length;
    const completedTopics = modTopics.filter(t => progress[t.id]?.status === 'completed').length;
    const inProgressTopics = modTopics.filter(t => progress[t.id]?.status === 'in_progress').length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const modScores = modTopics
      .map(t => progress[t.id]?.score)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s));

    const quizzesAttempted = modScores.length;
    const averageQuizScore = quizzesAttempted > 0
      ? Math.round(modScores.reduce((a, b) => a + b, 0) / quizzesAttempted)
      : null;

    let status: ModuleProgressStats['status'] = 'not_started';
    if (completedTopics === totalTopics && totalTopics > 0) {
      status = 'completed';
    } else if (completedTopics > 0 || inProgressTopics > 0) {
      status = 'in_progress';
    }

    return {
      module: mod,
      topics: modTopics,
      totalTopics,
      completedTopics,
      inProgressTopics,
      progressPercent,
      averageQuizScore,
      quizzesAttempted,
      status
    };
  });
}

export function getFullBadgeCatalog(
  userBadges: UserBadge[],
  progress: Record<string, UserProgress>,
  streak: UserStreak
): BadgeCatalogItem[] {
  const earnedMap = new Map<string, UserBadge>();
  userBadges.forEach(b => earnedMap.set(b.badgeType, b));

  const totalTopicsCount = TOPICS.length;
  const completedTopicsCount = Object.values(progress).filter(p => p.status === 'completed').length;
  const passedQuizzesCount = Object.values(progress).filter(p => p.score !== undefined && p.score >= 70).length;
  const perfectScoreCount = Object.values(progress).filter(p => p.score === 100).length;
  const maxStreak = Math.max(streak.currentStreak || 0, streak.longestStreak || 0);

  const catalog: BadgeCatalogItem[] = [
    // Milestones
    {
      id: 'badge-first-step',
      badgeType: 'first_step',
      title: 'First Step',
      description: 'Complete your very first topic unit on Waynautic Academy.',
      category: 'Milestones',
      iconName: 'Zap',
      requirementText: 'Complete 1 topic lesson',
      currentValue: Math.min(completedTopicsCount, 1),
      targetValue: 1,
      progressPercent: completedTopicsCount >= 1 ? 100 : 0,
      isUnlocked: earnedMap.has('first_step') || completedTopicsCount >= 1,
      earnedAt: earnedMap.get('first_step')?.earnedAt
    },
    {
      id: 'badge-halfway-hero',
      badgeType: 'halfway_hero',
      title: 'Halfway Hero',
      description: 'Complete 50% or more of the entire curriculum topics.',
      category: 'Milestones',
      iconName: 'Trophy',
      requirementText: `Complete ${Math.ceil(totalTopicsCount / 2)} topics`,
      currentValue: Math.min(completedTopicsCount, Math.ceil(totalTopicsCount / 2)),
      targetValue: Math.ceil(totalTopicsCount / 2),
      progressPercent: Math.min(100, Math.round((completedTopicsCount / Math.max(1, Math.ceil(totalTopicsCount / 2))) * 100)),
      isUnlocked: earnedMap.has('halfway_hero') || completedTopicsCount >= Math.ceil(totalTopicsCount / 2),
      earnedAt: earnedMap.get('halfway_hero')?.earnedAt
    },
    {
      id: 'badge-curriculum-champion',
      badgeType: 'curriculum_champion',
      title: 'Curriculum Champion',
      description: 'Master 100% of all curriculum topics and specialized AI modules.',
      category: 'Milestones',
      iconName: 'Crown',
      requirementText: `Complete all ${totalTopicsCount} topics`,
      currentValue: Math.min(completedTopicsCount, totalTopicsCount),
      targetValue: totalTopicsCount,
      progressPercent: Math.min(100, Math.round((completedTopicsCount / Math.max(1, totalTopicsCount)) * 100)),
      isUnlocked: earnedMap.has('curriculum_champion') || (totalTopicsCount > 0 && completedTopicsCount === totalTopicsCount),
      earnedAt: earnedMap.get('curriculum_champion')?.earnedAt
    },

    // Quizzes
    {
      id: 'badge-quiz-master',
      badgeType: 'quiz_master',
      title: 'Quiz Master',
      description: 'Score 70%+ on 5 different topic quizzes.',
      category: 'Quizzes',
      iconName: 'Award',
      requirementText: 'Pass 5 quizzes with 70%+',
      currentValue: Math.min(passedQuizzesCount, 5),
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((passedQuizzesCount / 5) * 100)),
      isUnlocked: earnedMap.has('quiz_master') || passedQuizzesCount >= 5,
      earnedAt: earnedMap.get('quiz_master')?.earnedAt
    },
    {
      id: 'badge-perfect-score',
      badgeType: 'perfect_score',
      title: 'Flawless Mind',
      description: 'Achieve a perfect 100% score on any topic quiz.',
      category: 'Quizzes',
      iconName: 'Sparkles',
      requirementText: 'Score 100% on 1 quiz',
      currentValue: Math.min(perfectScoreCount, 1),
      targetValue: 1,
      progressPercent: perfectScoreCount >= 1 ? 100 : 0,
      isUnlocked: earnedMap.has('perfect_score') || perfectScoreCount >= 1,
      earnedAt: earnedMap.get('perfect_score')?.earnedAt
    },

    // Streaks
    {
      id: 'badge-streak-3',
      badgeType: 'streak_3',
      title: 'Consistent Learner',
      description: 'Maintain a 3-day consecutive learning streak.',
      category: 'Streaks',
      iconName: 'Flame',
      requirementText: '3 consecutive active days',
      currentValue: Math.min(maxStreak, 3),
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((maxStreak / 3) * 100)),
      isUnlocked: earnedMap.has('streak_3') || maxStreak >= 3,
      earnedAt: earnedMap.get('streak_3')?.earnedAt
    },
    {
      id: 'badge-streak-7',
      badgeType: 'streak_7',
      title: 'Unstoppable Momentum',
      description: 'Maintain a 7-day consecutive learning streak.',
      category: 'Streaks',
      iconName: 'Flame',
      requirementText: '7 consecutive active days',
      currentValue: Math.min(maxStreak, 7),
      targetValue: 7,
      progressPercent: Math.min(100, Math.round((maxStreak / 7) * 100)),
      isUnlocked: earnedMap.has('streak_7') || maxStreak >= 7,
      earnedAt: earnedMap.get('streak_7')?.earnedAt
    },

    // Per-Module Specialists
    ...MODULES.map(mod => {
      const modTopics = TOPICS.filter(t => t.moduleSlug === mod.slug);
      const doneCount = modTopics.filter(t => progress[t.id]?.status === 'completed').length;
      const badgeType = `module_${mod.slug}`;
      const isUnlocked = earnedMap.has(badgeType) || (modTopics.length > 0 && doneCount === modTopics.length);

      return {
        id: `badge-mod-${mod.slug}`,
        badgeType,
        title: `${mod.title} Specialist`,
        description: `Master all topic lessons in the ${mod.title} module.`,
        category: 'Modules' as const,
        iconName: 'CheckCircle2',
        requirementText: `Complete ${modTopics.length}/${modTopics.length} topics in Module 0${mod.orderIndex}`,
        currentValue: doneCount,
        targetValue: modTopics.length,
        progressPercent: modTopics.length > 0 ? Math.round((doneCount / modTopics.length) * 100) : 0,
        isUnlocked,
        earnedAt: earnedMap.get(badgeType)?.earnedAt
      };
    })
  ];

  return catalog;
}
