// Waynautic Academy - Curriculum & Content Service
// Allows Admin account to add, edit, and manage topics and quiz questions dynamically.

import { TOPICS, getQuizForTopic } from '@/data/seedTopics';
import { MODULES, Topic, QuizQuestion } from '@/data/seedModules';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const CUSTOM_TOPICS_STORAGE_KEY = 'waynautic_admin_custom_topics';
const CUSTOM_QUIZZES_STORAGE_KEY = 'waynautic_admin_custom_quizzes';
const DELETED_TOPICS_STORAGE_KEY = 'waynautic_admin_deleted_topics';

/**
 * Returns all active topics, merging seed data with admin additions and modifications.
 */
export function getAllTopics(): Topic[] {
  if (typeof window === 'undefined') {
    return TOPICS;
  }

  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(DELETED_TOPICS_STORAGE_KEY) || '[]');
    const customTopics: Topic[] = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]');

    // 1. Filter out deleted seed topics
    let topics = TOPICS.filter((t) => !deletedIds.includes(t.id));

    // 2. Apply modifications to existing topics
    const customMap = new Map<string, Topic>();
    const newTopics: Topic[] = [];

    customTopics.forEach((ct) => {
      if (TOPICS.some((t) => t.id === ct.id)) {
        customMap.set(ct.id, ct);
      } else if (!deletedIds.includes(ct.id)) {
        newTopics.push(ct);
      }
    });

    topics = topics.map((t) => (customMap.has(t.id) ? customMap.get(t.id)! : t));

    // 3. Append new topics created by admin
    topics = [...topics, ...newTopics];

    return topics;
  } catch (err) {
    console.warn('Error reading custom topics from storage:', err);
    return TOPICS;
  }
}

/**
 * Find a specific topic by module and topic slugs.
 */
export function getTopicBySlugs(moduleSlug: string, topicSlug: string): Topic | undefined {
  const topics = getAllTopics();
  return topics.find((t) => t.moduleSlug === moduleSlug && t.slug === topicSlug);
}

/**
 * Save or update a topic.
 */
export async function saveTopic(topicData: {
  id?: string;
  moduleSlug: string;
  title: string;
  slug?: string;
  description: string;
  videoUrl?: string;
  videoProvider?: 'youtube' | 'bunny' | 'cloudflare';
  orderIndex?: number;
  estimatedMinutes?: number;
  textContent: string;
}): Promise<Topic> {
  const existingId = topicData.id;
  const currentTopics = getAllTopics();
  const targetModule = MODULES.find((m) => m.slug === topicData.moduleSlug) || MODULES[0];

  const cleanSlug = topicData.slug?.trim()
    ? topicData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : topicData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const id = existingId || `t-custom-${Date.now()}`;
  const existingTopic = currentTopics.find((t) => t.id === id);

  const updatedTopic: Topic = {
    id,
    moduleId: targetModule.id,
    moduleSlug: targetModule.slug,
    slug: cleanSlug || `topic-${Date.now()}`,
    title: topicData.title.trim(),
    description: topicData.description.trim(),
    videoUrl: topicData.videoUrl?.trim() || 'https://www.youtube.com/embed/zxQyTK8ckyY',
    videoProvider: topicData.videoProvider || 'youtube',
    orderIndex: topicData.orderIndex || (existingTopic ? existingTopic.orderIndex : currentTopics.length + 1),
    estimatedMinutes: topicData.estimatedMinutes || 15,
    textContent: topicData.textContent || `# ${topicData.title}\n\nAdd your lesson notes and code examples here.`
  };

  if (typeof window !== 'undefined') {
    try {
      const customTopics: Topic[] = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]');
      const filtered = customTopics.filter((t) => t.id !== id);
      filtered.push(updatedTopic);
      localStorage.setItem(CUSTOM_TOPICS_STORAGE_KEY, JSON.stringify(filtered));

      // Remove from deleted list if it was re-saved
      const deletedIds: string[] = JSON.parse(localStorage.getItem(DELETED_TOPICS_STORAGE_KEY) || '[]');
      if (deletedIds.includes(id)) {
        localStorage.setItem(
          DELETED_TOPICS_STORAGE_KEY,
          JSON.stringify(deletedIds.filter((d) => d !== id))
        );
      }

      window.dispatchEvent(new Event('waynautic_curriculum_changed'));
    } catch (err) {
      console.error('Failed to save topic in local storage:', err);
    }
  }

  // Attempt Supabase sync if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from('topics').upsert({
        id: updatedTopic.id,
        module_id: updatedTopic.moduleId,
        module_slug: updatedTopic.moduleSlug,
        slug: updatedTopic.slug,
        title: updatedTopic.title,
        description: updatedTopic.description,
        video_url: updatedTopic.videoUrl,
        video_provider: updatedTopic.videoProvider,
        order_index: updatedTopic.orderIndex,
        estimated_minutes: updatedTopic.estimatedMinutes,
        text_content: updatedTopic.textContent,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      // Non-blocking fallback to local storage
    }
  }

  return updatedTopic;
}

/**
 * Delete / Hide a topic.
 */
export async function deleteTopic(topicId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(DELETED_TOPICS_STORAGE_KEY) || '[]');
    if (!deletedIds.includes(topicId)) {
      deletedIds.push(topicId);
      localStorage.setItem(DELETED_TOPICS_STORAGE_KEY, JSON.stringify(deletedIds));
    }

    const customTopics: Topic[] = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]');
    const remaining = customTopics.filter((t) => t.id !== topicId);
    localStorage.setItem(CUSTOM_TOPICS_STORAGE_KEY, JSON.stringify(remaining));

    window.dispatchEvent(new Event('waynautic_curriculum_changed'));
    return true;
  } catch (err) {
    console.error('Failed to delete topic:', err);
    return false;
  }
}

/**
 * Retrieve quiz questions for a topic, incorporating admin additions/edits.
 */
export function getTopicQuiz(topicId: string, topicTitle: string): QuizQuestion[] {
  if (typeof window === 'undefined') {
    return getQuizForTopic(topicId, topicTitle);
  }

  try {
    const customQuizzes: Record<string, QuizQuestion[]> = JSON.parse(
      localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}'
    );

    if (customQuizzes[topicId] && customQuizzes[topicId].length > 0) {
      return customQuizzes[topicId];
    }
  } catch (err) {
    console.warn('Error reading custom quiz from storage:', err);
  }

  return getQuizForTopic(topicId, topicTitle);
}

/**
 * Save or update quiz questions for a topic.
 */
export async function saveTopicQuiz(topicId: string, questions: QuizQuestion[]): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const customQuizzes: Record<string, QuizQuestion[]> = JSON.parse(
      localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}'
    );

    customQuizzes[topicId] = questions;
    localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(customQuizzes));
    window.dispatchEvent(new Event('waynautic_curriculum_changed'));
  } catch (err) {
    console.error('Failed to save quiz in storage:', err);
  }

  // Attempt Supabase sync if configured
  if (isSupabaseConfigured) {
    try {
      for (const q of questions) {
        await supabase.from('quiz_questions').upsert({
          id: q.id,
          topic_id: q.topicId,
          question_text: q.questionText,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation
        });
      }
    } catch (e) {
      // Non-blocking fallback
    }
  }
}

/**
 * Reset all topics and quizzes back to platform default seed data.
 */
export function resetCurriculumToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CUSTOM_TOPICS_STORAGE_KEY);
  localStorage.removeItem(CUSTOM_QUIZZES_STORAGE_KEY);
  localStorage.removeItem(DELETED_TOPICS_STORAGE_KEY);
  window.dispatchEvent(new Event('waynautic_curriculum_changed'));
}
