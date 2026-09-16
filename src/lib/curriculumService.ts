// Waynautic Academy - Curriculum & Content Service
// Allows Admin account to add, edit, and manage topics and quiz questions dynamically.
// Synchronizes seamlessly across Admin Portal, Academy Portal, Server API, and Supabase Cloud.

import { TOPICS, getQuizForTopic } from '@/data/seedTopics';
import { MODULES, Topic, QuizQuestion, VideoChapter } from '@/data/seedModules';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const CUSTOM_TOPICS_STORAGE_KEY = 'waynautic_admin_custom_topics';
export const CUSTOM_QUIZZES_STORAGE_KEY = 'waynautic_admin_custom_quizzes';
export const DELETED_TOPICS_STORAGE_KEY = 'waynautic_admin_deleted_topics';
export const CURRICULUM_SYNC_TIMESTAMP_KEY = 'waynautic_curriculum_last_updated';

// Cross-tab broadcast channel for instantaneous synchronization
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('waynautic_curriculum_sync');
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'curriculum_updated') {
        window.dispatchEvent(new Event('waynautic_curriculum_changed'));
      }
    };
  } catch (err) {
    console.warn('[CurriculumService] BroadcastChannel not available:', err);
  }
}

// Multi-tab storage event listener fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (
      e.key === CURRICULUM_SYNC_TIMESTAMP_KEY ||
      e.key === CUSTOM_TOPICS_STORAGE_KEY ||
      e.key === CUSTOM_QUIZZES_STORAGE_KEY ||
      e.key === DELETED_TOPICS_STORAGE_KEY
    ) {
      window.dispatchEvent(new Event('waynautic_curriculum_changed'));
    }
  });
}

// Multi-device cloud realtime synchronization listener
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  try {
    supabase
      .channel('waynautic_curriculum_cloud_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, () => {
        fetchCurriculumUpdates();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_questions' }, () => {
        fetchCurriculumUpdates();
      })
      .subscribe();
  } catch (err) {
    console.warn('[CurriculumService] Supabase Realtime setup warning:', err);
  }
}

/**
 * Notifies all tabs and components on the client that curriculum data changed.
 */
export function notifyCurriculumChange(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CURRICULUM_SYNC_TIMESTAMP_KEY, Date.now().toString());
  } catch {}

  window.dispatchEvent(new Event('waynautic_curriculum_changed'));

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'curriculum_updated', timestamp: Date.now() });
    } catch {}
  }
}

/**
 * Returns all active topics, merging seed data with admin additions and modifications.
 */
export function getAllTopics(): Topic[] {
  if (typeof window === 'undefined') {
    try {
      // Server-side: read custom topics file if present
      const fs = require('fs');
      const path = require('path');
      const file = path.join(process.cwd(), 'src', 'data', 'custom_curriculum.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf-8');
        const parsed = JSON.parse(raw);
        const deletedIds: string[] = Array.isArray(parsed?.deletedTopicIds) ? parsed.deletedTopicIds : [];
        const customTopics: Topic[] = Array.isArray(parsed?.customTopics) ? parsed.customTopics : [];

        let topics = TOPICS.filter((t) => !deletedIds.includes(t.id));
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
        return [...topics, ...newTopics];
      }
    } catch {}
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
 * Find a specific topic by module and topic slugs with smart fallbacks.
 */
export function getTopicBySlugs(moduleSlug: string, topicSlug: string): Topic | undefined {
  const topics = getAllTopics();

  // 1. Exact match by module and slug
  const match = topics.find((t) => t.moduleSlug === moduleSlug && t.slug === topicSlug);
  if (match) return match;

  // 2. Match by topic id
  const matchById = topics.find((t) => t.moduleSlug === moduleSlug && t.id === topicSlug);
  if (matchById) return matchById;

  // 3. Global slug match across any module
  const globalMatch = topics.find((t) => t.slug === topicSlug);
  if (globalMatch) return globalMatch;

  // 4. Match by slugified title
  const slugifiedTitle = topicSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const titleMatch = topics.find((t) => {
    const tSlug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return t.moduleSlug === moduleSlug && tSlug === slugifiedTitle;
  });

  return titleMatch;
}

/**
 * Asynchronously finds a topic by module and topic slugs, querying Supabase Cloud if not yet cached.
 * Critical for direct SSR navigation, cross-device deep links, and dynamic topics.
 */
export async function getTopicBySlugsAsync(moduleSlug: string, topicSlug: string): Promise<Topic | undefined> {
  const local = getTopicBySlugs(moduleSlug, topicSlug);
  if (local) return local;

  if (isSupabaseConfigured) {
    try {
      const { data: rows } = await supabase
        .from('topics')
        .select('*')
        .or(`slug.eq.${topicSlug},id.eq.${topicSlug}`);
      
      if (rows && rows.length > 0) {
        const row = rows[0];
        if (row.title !== '__DELETED__' && row.description !== '__DELETED__') {
          return {
            id: row.id,
            moduleId: row.module_id || '11111111-1111-4111-a111-111111111111',
            moduleSlug: row.module_slug || moduleSlug,
            slug: row.slug,
            title: row.title,
            description: row.description || '',
            videoUrl: row.video_url || 'https://www.youtube.com/embed/zxQyTK8ckyY',
            videoProvider: row.video_provider || 'youtube',
            orderIndex: row.order_index || 1,
            estimatedMinutes: row.estimated_minutes || 15,
            textContent: row.text_content || '',
            chapters: Array.isArray(row.chapters) ? row.chapters : undefined
          };
        }
      }
    } catch (err) {
      console.warn('[CurriculumService] getTopicBySlugsAsync error:', err);
    }
  }

  return undefined;
}

/**
 * Fetches latest curriculum updates from Supabase Cloud / server API and synchronizes client cache.
 */
export async function fetchCurriculumUpdates(): Promise<Topic[]> {
  if (typeof window === 'undefined') return getAllTopics();

  let hasUpdates = false;

  // 1. Primary Cloud Source: Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: supaTopics, error: topicErr } = await supabase.from('topics').select('*');
      if (!topicErr && supaTopics) {
        const deletedFromDb: string[] = supaTopics
          .filter((row: any) => row.title === '__DELETED__' || row.description === '__DELETED__')
          .map((row: any) => row.id);

        const activeSupaTopics = supaTopics.filter(
          (row: any) => row.title !== '__DELETED__' && row.description !== '__DELETED__'
        );

        const mappedTopics: Topic[] = activeSupaTopics.map((row: any) => ({
          id: row.id,
          moduleId: row.module_id || '11111111-1111-4111-a111-111111111111',
          moduleSlug: row.module_slug || 'llms',
          slug: row.slug,
          title: row.title,
          description: row.description || '',
          videoUrl: row.video_url || 'https://www.youtube.com/embed/zxQyTK8ckyY',
          videoProvider: row.video_provider || 'youtube',
          orderIndex: row.order_index || 1,
          estimatedMinutes: row.estimated_minutes || 15,
          textContent: row.text_content || '',
          chapters: row.chapters && Array.isArray(row.chapters) ? row.chapters : undefined
        }));

        // Check if there are local custom topics in this browser that failed to sync to Supabase in past attempts
        const localCustom: Topic[] = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]');
        const supaIds = new Set(supaTopics.map((r: any) => r.id));
        const unsyncedLocal = localCustom.filter((t) => !supaIds.has(t.id) && !deletedFromDb.includes(t.id));

        if (unsyncedLocal.length > 0) {
          // Auto-migrate/sync unsynced local topics to Supabase with proper module_id
          for (const unsynced of unsyncedLocal) {
            const targetMod = MODULES.find((m) => m.slug === unsynced.moduleSlug) || MODULES[0];
            const { error: upsertErr } = await supabase.from('topics').upsert({
              id: unsynced.id,
              module_id: unsynced.moduleId || targetMod.id,
              module_slug: unsynced.moduleSlug || targetMod.slug,
              slug: unsynced.slug,
              title: unsynced.title,
              description: unsynced.description || '',
              video_url: unsynced.videoUrl || 'https://www.youtube.com/embed/zxQyTK8ckyY',
              video_provider: unsynced.videoProvider || 'youtube',
              order_index: unsynced.orderIndex || 1,
              estimated_minutes: unsynced.estimatedMinutes || 15,
              text_content: unsynced.textContent || '',
              chapters: unsynced.chapters || [],
              updated_at: new Date().toISOString()
            });
            if (!upsertErr) {
              mappedTopics.push(unsynced);
            }
          }
        }

        // Update local deleted topics list
        const localDeleted: string[] = JSON.parse(localStorage.getItem(DELETED_TOPICS_STORAGE_KEY) || '[]');
        const mergedDeleted = Array.from(new Set([...localDeleted, ...deletedFromDb]));
        localStorage.setItem(DELETED_TOPICS_STORAGE_KEY, JSON.stringify(mergedDeleted));

        // Update local custom topics list from cloud
        const prevJson = localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]';
        const newJson = JSON.stringify(mappedTopics);
        if (prevJson !== newJson) {
          localStorage.setItem(CUSTOM_TOPICS_STORAGE_KEY, newJson);
          hasUpdates = true;
        }
      }

      // Sync all quiz questions from Supabase
      const { data: supaQuestions, error: quizErr } = await supabase.from('quiz_questions').select('*');
      if (!quizErr && supaQuestions) {
        const customQuizzes: Record<string, QuizQuestion[]> = {};
        supaQuestions.forEach((q: any) => {
          const tId = q.topic_id;
          if (!customQuizzes[tId]) {
            customQuizzes[tId] = [];
          }
          customQuizzes[tId].push({
            id: q.id,
            topicId: q.topic_id,
            questionText: q.question_text,
            options: Array.isArray(q.options) ? q.options : [],
            correctOptionIndex: q.correct_option_index,
            explanation: q.explanation || ''
          });
        });

        const prevQuizJson = localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}';
        const newQuizJson = JSON.stringify(customQuizzes);
        if (prevQuizJson !== newQuizJson) {
          localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, newQuizJson);
          hasUpdates = true;
        }
      }
    } catch (supaErr) {
      console.warn('[CurriculumService] Supabase sync warning:', supaErr);
    }
  } else {
    // Fallback: Fetch from server API when Supabase is not configured
    try {
      const res = await fetch('/api/curriculum', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.customTopics) && data.customTopics.length > 0) {
          const localCustom: Topic[] = JSON.parse(localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY) || '[]');
          const localDeleted: string[] = JSON.parse(localStorage.getItem(DELETED_TOPICS_STORAGE_KEY) || '[]');

          const remoteCustom: Topic[] = data.customTopics;
          const remoteDeleted: string[] = Array.isArray(data.deletedTopicIds) ? data.deletedTopicIds : [];

          const mergedMap = new Map<string, Topic>();
          localCustom.forEach((t) => mergedMap.set(t.id, t));
          remoteCustom.forEach((t) => mergedMap.set(t.id, t));
          const mergedTopics = Array.from(mergedMap.values());

          const mergedDeleted = Array.from(new Set([...localDeleted, ...remoteDeleted]));

          const topicsChanged = JSON.stringify(localCustom) !== JSON.stringify(mergedTopics);
          const deletedChanged = JSON.stringify(localDeleted) !== JSON.stringify(mergedDeleted);

          if (topicsChanged || deletedChanged) {
            localStorage.setItem(CUSTOM_TOPICS_STORAGE_KEY, JSON.stringify(mergedTopics));
            localStorage.setItem(DELETED_TOPICS_STORAGE_KEY, JSON.stringify(mergedDeleted));
            hasUpdates = true;
          }
        }
      }
    } catch (apiErr) {
      console.warn('[CurriculumService] Server API sync error:', apiErr);
    }
  }

  if (hasUpdates) {
    notifyCurriculumChange();
  }

  return getAllTopics();
}

/**
 * Save or update a topic with cloud API, Supabase, and local persistence.
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
  chapters?: VideoChapter[];
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
    textContent: topicData.textContent || `# ${topicData.title}\n\nAdd your lesson notes and code examples here.`,
    chapters: topicData.chapters || existingTopic?.chapters
  };

  // 1. Update client localStorage immediately for zero latency
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

      notifyCurriculumChange();
    } catch (err) {
      console.error('Failed to save topic in local storage:', err);
    }
  }

  // 2. Sync to Supabase Cloud if configured (Guaranteed persistence across all devices)
  if (isSupabaseConfigured) {
    try {
      const payload: Record<string, any> = {
        id: updatedTopic.id,
        module_id: updatedTopic.moduleId || targetModule.id,
        module_slug: updatedTopic.moduleSlug || targetModule.slug,
        slug: updatedTopic.slug,
        title: updatedTopic.title,
        description: updatedTopic.description,
        video_url: updatedTopic.videoUrl,
        video_provider: updatedTopic.videoProvider,
        order_index: updatedTopic.orderIndex,
        estimated_minutes: updatedTopic.estimatedMinutes,
        text_content: updatedTopic.textContent,
        chapters: updatedTopic.chapters || [],
        updated_at: new Date().toISOString()
      };

      const { error: supaErr } = await supabase.from('topics').upsert(payload);
      if (supaErr) {
        console.error('[CurriculumService] Supabase topic save error:', supaErr);
      }
    } catch (supaErr) {
      console.warn('[CurriculumService] Supabase topic save warning:', supaErr);
    }
  }

  // 3. Asynchronously sync to Server API (filesystem backup)
  try {
    await fetch('/api/curriculum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTopic)
    });
  } catch (apiErr) {
    console.warn('[CurriculumService] Server API save warning:', apiErr);
  }

  notifyCurriculumChange();
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

    notifyCurriculumChange();
  } catch (err) {
    console.error('Failed to delete topic from local storage:', err);
    return false;
  }

  // Sync delete to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      if (topicId.startsWith('t-custom-')) {
        // Custom topic: delete row from topics and quiz_questions
        await supabase.from('quiz_questions').delete().eq('topic_id', topicId);
        await supabase.from('topics').delete().eq('id', topicId);
      } else {
        // Seed topic (e.g. t-1): store tombstone row in topics table so all devices know it's deleted
        const targetTopic = TOPICS.find((t) => t.id === topicId);
        const targetModule = MODULES.find((m) => m.slug === targetTopic?.moduleSlug) || MODULES[0];
        await supabase.from('topics').upsert({
          id: topicId,
          module_id: targetModule.id,
          module_slug: targetTopic?.moduleSlug || 'llms',
          slug: `deleted-${topicId}`,
          title: '__DELETED__',
          description: '__DELETED__',
          video_url: '',
          video_provider: 'youtube',
          order_index: 999,
          estimated_minutes: 0,
          text_content: '',
          chapters: [],
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('[CurriculumService] Supabase delete warning:', e);
    }
  }

  // Sync delete to Server API
  try {
    await fetch(`/api/curriculum?id=${encodeURIComponent(topicId)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[CurriculumService] Server API delete warning:', err);
  }

  return true;
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
 * Fetches latest quiz questions for a topic from server API & Supabase.
 */
export async function fetchTopicQuizUpdates(topicId: string): Promise<QuizQuestion[] | null> {
  if (typeof window === 'undefined' || !topicId) return null;

  // 1. Fetch from Server API
  try {
    const res = await fetch(`/api/curriculum/quiz?topicId=${encodeURIComponent(topicId)}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.questions) && data.questions.length > 0) {
        const customQuizzes: Record<string, QuizQuestion[]> = JSON.parse(
          localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}'
        );
        customQuizzes[topicId] = data.questions;
        localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(customQuizzes));
        notifyCurriculumChange();
        return data.questions;
      }
    }
  } catch (err) {
    console.warn('[CurriculumService] Quiz fetch error:', err);
  }

  // 2. Fetch from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: supaQuestions } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('topic_id', topicId);

      if (supaQuestions && supaQuestions.length > 0) {
        const questions: QuizQuestion[] = supaQuestions.map((q: any) => ({
          id: q.id,
          topicId: q.topic_id,
          questionText: q.question_text,
          options: q.options,
          correctOptionIndex: q.correct_option_index,
          explanation: q.explanation
        }));

        const customQuizzes: Record<string, QuizQuestion[]> = JSON.parse(
          localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}'
        );
        customQuizzes[topicId] = questions;
        localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(customQuizzes));
        notifyCurriculumChange();
        return questions;
      }
    } catch (e) {
      console.warn('[CurriculumService] Supabase quiz query warning:', e);
    }
  }

  return null;
}

/**
 * Save or update quiz questions for a topic.
 */
export async function saveTopicQuiz(topicId: string, questions: QuizQuestion[]): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. Save to local storage
  try {
    const customQuizzes: Record<string, QuizQuestion[]> = JSON.parse(
      localStorage.getItem(CUSTOM_QUIZZES_STORAGE_KEY) || '{}'
    );

    customQuizzes[topicId] = questions;
    localStorage.setItem(CUSTOM_QUIZZES_STORAGE_KEY, JSON.stringify(customQuizzes));
    notifyCurriculumChange();
  } catch (err) {
    console.error('Failed to save quiz in storage:', err);
  }

  // 2. Sync to Supabase Cloud in batch if configured
  if (isSupabaseConfigured) {
    try {
      // First delete existing questions for this topic to remove any deleted questions
      await supabase.from('quiz_questions').delete().eq('topic_id', topicId);

      // Insert all questions in single batch
      if (questions.length > 0) {
        const rows = questions.map((q, idx) => ({
          id: q.id || `q-${topicId}-${idx + 1}`,
          topic_id: q.topicId || topicId,
          question_text: q.questionText,
          options: q.options,
          correct_option_index: q.correctOptionIndex,
          explanation: q.explanation || '',
          updated_at: new Date().toISOString()
        }));
        const { error: quizErr } = await supabase.from('quiz_questions').upsert(rows);
        if (quizErr) {
          console.error('[CurriculumService] Supabase quiz batch upsert error:', quizErr);
        }
      }
    } catch (e) {
      console.warn('[CurriculumService] Supabase quiz upsert warning:', e);
    }
  }

  // 3. Sync to Server API
  try {
    await fetch('/api/curriculum/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, questions })
    });
  } catch (err) {
    console.warn('[CurriculumService] Quiz server sync error:', err);
  }

  notifyCurriculumChange();
}

/**
 * Reset all topics and quizzes back to platform default seed data.
 */
export function resetCurriculumToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CUSTOM_TOPICS_STORAGE_KEY);
  localStorage.removeItem(CUSTOM_QUIZZES_STORAGE_KEY);
  localStorage.removeItem(DELETED_TOPICS_STORAGE_KEY);
  notifyCurriculumChange();
}

/**
 * Resolves or dynamically generates jump points/chapters for a video.
 */
export function getTopicChapters(topic: Topic, allTopics?: Topic[]): VideoChapter[] {
  if (topic.chapters && topic.chapters.length > 0) {
    return topic.chapters;
  }

  const topicsList = allTopics || getAllTopics();

  // Check if multiple topics in the system share the exact same videoUrl
  const sharingTopics = topicsList.filter(
    (t) => t.videoUrl && t.videoUrl === topic.videoUrl
  ).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (sharingTopics.length > 1) {
    let accumulatedSeconds = 0;
    return sharingTopics.map((t, idx) => {
      const chapterTime = accumulatedSeconds;
      accumulatedSeconds += Math.max(3, t.estimatedMinutes || 5) * 60;
      return {
        id: `topic-${t.id}`,
        title: `${t.orderIndex ? `${t.orderIndex}. ` : ''}${t.title}`,
        timestamp: idx === 0 ? 0 : chapterTime,
        description: t.description,
        topicSlug: t.slug
      };
    });
  }

  // Parse markdown ## headings to create sensible chapters for in-depth video navigation
  const headingMatches = [...(topic.textContent || '').matchAll(/^##\s+(.+)$/gm)];
  if (headingMatches.length > 0) {
    const totalDurationSeconds = Math.max((topic.estimatedMinutes || 15) * 60, 600);
    const interval = Math.floor(totalDurationSeconds / (headingMatches.length + 1));

    const chapters: VideoChapter[] = [
      {
        id: 'intro',
        title: 'Introduction & Overview',
        timestamp: 0,
        description: topic.description
      }
    ];

    headingMatches.forEach((m, idx) => {
      const headingTitle = m[1].replace(/[*_`#]/g, '').trim();
      chapters.push({
        id: `section-${idx + 1}`,
        title: headingTitle,
        timestamp: (idx + 1) * interval,
        description: `Deep dive into ${headingTitle}`
      });
    });

    chapters.push({
      id: 'summary',
      title: 'Key Takeaways & Summary',
      timestamp: Math.max(0, totalDurationSeconds - 90),
      description: 'Review of core principles and next steps'
    });

    return chapters;
  }

  // Default fallback chapters
  return [
    { id: 'c1', title: 'Introduction & Concepts', timestamp: 0 },
    { id: 'c2', title: 'Core Architecture & Theory', timestamp: 120 },
    { id: 'c3', title: 'Practical Code Walkthrough', timestamp: 300 },
    { id: 'c4', title: 'Summary & Next Steps', timestamp: 540 }
  ];
}

/**
 * Resolves the candidate Topic to resume learning.
 * Bypasses any topic that is already completed.
 * Returns null if all topics are completed.
 */
export function getResumeTopic(
  profile?: { lastAccessedTopicId?: string },
  progress?: Record<string, { status: string }>
): Topic | null {
  const topics = getAllTopics();
  if (!topics || topics.length === 0) return null;

  // If user has completed every single topic, return null so 100% completion card is displayed
  if (progress && topics.every((t) => progress[t.id]?.status === 'completed' || progress[t.slug]?.status === 'completed')) {
    return null;
  }

  const lastId = profile?.lastAccessedTopicId;
  if (lastId) {
    const topic = topics.find((t) => t.id === lastId || t.slug === lastId);
    const isCompleted = topic && progress && (progress[topic.id]?.status === 'completed' || progress[topic.slug]?.status === 'completed');
    if (topic && !isCompleted) {
      return topic;
    }
  }

  // Find first incomplete topic in curriculum sequence
  if (progress) {
    const nextIncomplete = topics.find((t) => progress[t.id]?.status !== 'completed' && progress[t.slug]?.status !== 'completed');
    if (nextIncomplete) {
      return nextIncomplete;
    }
  }

  return topics[0] || null;
}

/**
 * Resolves the user's exact deep-link return destination (topic + tab).
 */
export function getResumeLearningUrl(
  profile?: { lastAccessedTopicId?: string; lastAccessedTab?: 'watch' | 'read' | 'quiz' },
  progress?: Record<string, { status: string }>
): string {
  const topic = getResumeTopic(profile, progress);
  if (!topic) {
    return '/curriculum';
  }
  const lastTab = profile?.lastAccessedTab || 'watch';
  return `/curriculum/${topic.moduleSlug}/${topic.slug}?tab=${lastTab}`;
}

/**
 * Calculates recommended topics related to the current topic.
 */
export function getRecommendedTopics(currentTopic: Topic, allTopics?: Topic[], limit: number = 3): Topic[] {
  const list = allTopics || getAllTopics();
  const otherTopics = list.filter((t) => t.id !== currentTopic.id);

  const sameModuleTopics = otherTopics.filter((t) => t.moduleSlug === currentTopic.moduleSlug);

  const currentIdx = list.findIndex((t) => t.id === currentTopic.id);
  const nextInRoadmap = currentIdx >= 0 && currentIdx < list.length - 1 ? list[currentIdx + 1] : null;

  const recommendations: Topic[] = [];

  if (nextInRoadmap && nextInRoadmap.id !== currentTopic.id) {
    recommendations.push(nextInRoadmap);
  }

  sameModuleTopics.forEach((t) => {
    if (!recommendations.some((r) => r.id === t.id) && recommendations.length < limit) {
      recommendations.push(t);
    }
  });

  otherTopics.forEach((t) => {
    if (!recommendations.some((r) => r.id === t.id) && recommendations.length < limit) {
      recommendations.push(t);
    }
  });

  return recommendations.slice(0, limit);
}
