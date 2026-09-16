import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase-backed quiz questions API
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseReady = Boolean(supabaseUrl && supabaseKey);

function getServerSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

// Filesystem fallback (dev only)
import fs from 'fs';
import path from 'path';
import { QuizQuestion } from '@/data/seedModules';

const STORAGE_FILE = path.join(process.cwd(), 'src', 'data', 'custom_quizzes.json');

interface QuizStorageData {
  quizzes: Record<string, QuizQuestion[]>;
  updatedAt: string;
}

function loadFromFilesystem(): QuizStorageData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        quizzes: parsed.quizzes && typeof parsed.quizzes === 'object' ? parsed.quizzes : {},
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch {}
  return { quizzes: {}, updatedAt: new Date().toISOString() };
}

function saveToFilesystem(data: QuizStorageData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

// ---------------------------------------------------------------------------
// GET — return quiz questions (optionally filtered by topicId)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get('topicId');

  if (isSupabaseReady) {
    try {
      const sb = getServerSupabase();
      let query = sb.from('quiz_questions').select('*');
      if (topicId) query = query.eq('topic_id', topicId);

      const { data: rows, error } = await query;
      if (!error && rows) {
        const questions: QuizQuestion[] = rows.map((q: any) => ({
          id: q.id,
          topicId: q.topic_id,
          questionText: q.question_text,
          options: Array.isArray(q.options) ? q.options : [],
          correctOptionIndex: q.correct_option_index,
          explanation: q.explanation || ''
        }));

        if (topicId) {
          return NextResponse.json({ topicId, questions, updatedAt: new Date().toISOString() });
        }
        // Group by topicId for full response
        const quizzes: Record<string, QuizQuestion[]> = {};
        questions.forEach((q) => {
          if (!quizzes[q.topicId]) quizzes[q.topicId] = [];
          quizzes[q.topicId].push(q);
        });
        return NextResponse.json({ quizzes, updatedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error('[API Quiz GET] Supabase error:', err);
    }
  }

  // Fallback: filesystem
  const data = loadFromFilesystem();
  if (topicId) {
    return NextResponse.json({ topicId, questions: data.quizzes[topicId] || [], updatedAt: data.updatedAt });
  }
  return NextResponse.json(data);
}

// ---------------------------------------------------------------------------
// POST — save quiz questions for a topic
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, questions } = body as { topicId: string; questions: QuizQuestion[] };

    if (!topicId || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing topicId or questions array' }, { status: 400 });
    }

    if (isSupabaseReady) {
      try {
        const sb = getServerSupabase();
        // Delete existing questions for this topic, then insert fresh
        await sb.from('quiz_questions').delete().eq('topic_id', topicId);

        if (questions.length > 0) {
          const rows = questions.map((q, idx) => ({
            id: q.id || `q-${topicId}-${idx + 1}`,
            topic_id: topicId,
            question_text: q.questionText,
            options: q.options,
            correct_option_index: q.correctOptionIndex,
            explanation: q.explanation || ''
          }));
          const { error } = await sb.from('quiz_questions').insert(rows);
          if (error) {
            console.error('[API Quiz POST] Supabase insert error:', error);
          } else {
            return NextResponse.json({ success: true, topicId, count: questions.length, updatedAt: new Date().toISOString() });
          }
        } else {
          return NextResponse.json({ success: true, topicId, count: 0, updatedAt: new Date().toISOString() });
        }
      } catch (err) {
        console.error('[API Quiz POST] Supabase error:', err);
      }
    }

    // Fallback: filesystem
    const current = loadFromFilesystem();
    current.quizzes[topicId] = questions;
    current.updatedAt = new Date().toISOString();
    saveToFilesystem(current);
    return NextResponse.json({ success: true, topicId, count: questions.length, updatedAt: current.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save quiz' }, { status: 500 });
  }
}
