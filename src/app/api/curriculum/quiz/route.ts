import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { QuizQuestion } from '@/data/seedModules';

// Path for server-side persistence of custom topic quizzes
const STORAGE_FILE = path.join(process.cwd(), 'src', 'data', 'custom_quizzes.json');

interface QuizStorageData {
  quizzes: Record<string, QuizQuestion[]>;
  updatedAt: string;
}

function loadServerQuizzes(): QuizStorageData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        quizzes: parsed.quizzes && typeof parsed.quizzes === 'object' ? parsed.quizzes : {},
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error('[API Quiz] Failed to read storage file:', err);
  }

  return {
    quizzes: {},
    updatedAt: new Date().toISOString()
  };
}

function saveServerQuizzes(data: QuizStorageData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API Quiz] Failed to write storage file:', err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get('topicId');
  const data = loadServerQuizzes();

  if (topicId) {
    const topicQuiz = data.quizzes[topicId] || [];
    return NextResponse.json({ topicId, questions: topicQuiz, updatedAt: data.updatedAt });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, questions } = body as { topicId: string; questions: QuizQuestion[] };

    if (!topicId || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing topicId or questions array' }, { status: 400 });
    }

    const current = loadServerQuizzes();
    current.quizzes[topicId] = questions;
    current.updatedAt = new Date().toISOString();

    saveServerQuizzes(current);

    return NextResponse.json({ success: true, topicId, count: questions.length, updatedAt: current.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save quiz' }, { status: 500 });
  }
}
