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
import { Topic } from '@/data/seedModules';

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
        const customTopics: Topic[] = rows.map((row: any) => ({
          id: row.id,
          moduleId: row.module_id || '',
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
        return NextResponse.json({
          customTopics,
          deletedTopicIds: [],
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
        const { error } = await sb.from('topics').upsert({
          id: topic.id,
          module_slug: topic.moduleSlug,
          slug: topic.slug,
          title: topic.title,
          description: topic.description,
          video_url: topic.videoUrl,
          video_provider: topic.videoProvider,
          order_index: topic.orderIndex,
          estimated_minutes: topic.estimatedMinutes,
          text_content: topic.textContent,
          chapters: topic.chapters || null
        });
        if (error) {
          console.error('[API Curriculum POST] Supabase upsert error:', error);
        } else {
          return NextResponse.json({ success: true, topic, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.error('[API Curriculum POST] Supabase error:', err);
      }
    }

    // Fallback: filesystem
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

    // Primary: delete from Supabase
    if (isSupabaseReady) {
      try {
        const sb = getServerSupabase();
        await sb.from('quiz_questions').delete().eq('topic_id', id);
        await sb.from('topics').delete().eq('id', id);
        return NextResponse.json({ success: true, deletedId: id, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error('[API Curriculum DELETE] Supabase error:', err);
      }
    }

    // Fallback: filesystem
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
