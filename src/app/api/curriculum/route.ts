import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase-backed curriculum API
// Falls back to filesystem only when Supabase is not configured.
// Vercel's filesystem is ephemeral — it resets on every deploy, which is why
// topics vanished on hard refresh. Supabase is the persistent source of truth.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);

function getServerSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

// Filesystem fallback (only used when Supabase is NOT configured)
import fs from 'fs';
import path from 'path';
import { Topic, MODULES } from '@/data/seedModules';
import { TOPICS } from '@/data/seedTopics';

const STORAGE_FILE = path.join(process.cwd(), 'src', 'data', 'custom_curriculum.json');

interface CurriculumStorageData {
  customTopics: Topic[];
  deletedTopicIds: string[];
  updatedAt: string;
}

function loadFromFilesystem(): CurriculumStorageData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        customTopics: Array.isArray(parsed.customTopics) ? parsed.customTopics : [],
        deletedTopicIds: Array.isArray(parsed.deletedTopicIds) ? parsed.deletedTopicIds : [],
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch {}
  return { customTopics: [], deletedTopicIds: [], updatedAt: new Date().toISOString() };
}

function saveToFilesystem(data: CurriculumStorageData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

// ---------------------------------------------------------------------------
// GET — return all custom topics
// ---------------------------------------------------------------------------
export async function GET() {
  // Primary: read from Supabase
  if (isSupabaseReady) {
    try {
      const sb = getServerSupabase();
      const { data: rows, error } = await sb.from('topics').select('*');
      if (!error && rows) {
        const customTopics: Topic[] = rows
          .filter((row: any) => row.title !== '__DELETED__' && row.description !== '__DELETED__')
          .map((row: any) => ({
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
            chapters: Array.isArray(row.chapters) ? row.chapters : undefined
          }));
        const deletedTopicIds: string[] = rows
          .filter((row: any) => row.title === '__DELETED__' || row.description === '__DELETED__')
          .map((row: any) => row.id);

        // Keep filesystem in sync with Supabase for SSR server components
        try {
          saveToFilesystem({
            customTopics,
            deletedTopicIds,
            updatedAt: new Date().toISOString()
          });
        } catch {}

        return NextResponse.json({
          customTopics,
          deletedTopicIds,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('[API Curriculum GET] Supabase error:', err);
    }
  }

  // Fallback: filesystem (dev only)
  const data = loadFromFilesystem();
  return NextResponse.json(data);
}

// ---------------------------------------------------------------------------
// POST — save or update a topic
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const topic = (await req.json()) as Topic;
    if (!topic || !topic.id || !topic.title) {
      return NextResponse.json({ error: 'Invalid topic payload' }, { status: 400 });
    }

    // Primary: upsert to Supabase
    if (isSupabaseReady) {
      try {
        const sb = getServerSupabase();
        const targetModule = MODULES.find((m) => m.slug === topic.moduleSlug) || MODULES[0];
        const moduleId = topic.moduleId || targetModule.id;

        const { error } = await sb.from('topics').upsert({
          id: topic.id,
          module_id: moduleId,
          module_slug: topic.moduleSlug || targetModule.slug,
          slug: topic.slug,
          title: topic.title,
          description: topic.description || '',
          video_url: topic.videoUrl || 'https://www.youtube.com/embed/zxQyTK8ckyY',
          video_provider: topic.videoProvider || 'youtube',
          order_index: topic.orderIndex || 1,
          estimated_minutes: topic.estimatedMinutes || 15,
          text_content: topic.textContent || '',
          chapters: topic.chapters || [],
          updated_at: new Date().toISOString()
        });
        if (error) {
          console.error('[API Curriculum POST] Supabase upsert error:', error);
        }
      } catch (err) {
        console.error('[API Curriculum POST] Supabase error:', err);
      }
    }

    // Filesystem sync: keep server SSR in sync as well
    const current = loadFromFilesystem();
    const filtered = current.customTopics.filter((t) => t.id !== topic.id);
    filtered.push(topic);
    const updatedData: CurriculumStorageData = {
      customTopics: filtered,
      deletedTopicIds: current.deletedTopicIds.filter((id) => id !== topic.id),
      updatedAt: new Date().toISOString()
    };
    saveToFilesystem(updatedData);
    return NextResponse.json({ success: true, topic, updatedAt: updatedData.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save topic' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE — remove a topic
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing topic id' }, { status: 400 });
    }

    // Primary: mark persistent tombstone and clear quizzes in Supabase
    if (isSupabaseReady) {
      try {
        const sb = getServerSupabase();
        await sb.from('quiz_questions').delete().eq('topic_id', id);

        const targetTopic = TOPICS.find((t) => t.id === id);
        const targetModule = MODULES.find((m) => m.slug === targetTopic?.moduleSlug) || MODULES[0];
        const moduleId = targetTopic?.moduleId || targetModule.id;
        const moduleSlug = targetTopic?.moduleSlug || targetModule.slug;

        await sb.from('topics').upsert({
          id: id,
          module_id: moduleId,
          module_slug: moduleSlug,
          slug: `deleted-${id}`,
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
      } catch (err) {
        console.error('[API Curriculum DELETE] Supabase error:', err);
      }
    }

    // Filesystem sync: remove from custom topics, add to deletedTopicIds
    const current = loadFromFilesystem();
    const updatedData: CurriculumStorageData = {
      customTopics: current.customTopics.filter((t) => t.id !== id),
      deletedTopicIds: Array.from(new Set([...current.deletedTopicIds, id])),
      updatedAt: new Date().toISOString()
    };
    saveToFilesystem(updatedData);
    return NextResponse.json({ success: true, deletedId: id, updatedAt: updatedData.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete topic' }, { status: 500 });
  }
}
