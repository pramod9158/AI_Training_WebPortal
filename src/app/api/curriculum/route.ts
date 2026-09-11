import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Topic } from '@/data/seedModules';

// Path for server-side persistence of custom curriculum modifications
const STORAGE_FILE = path.join(process.cwd(), 'src', 'data', 'custom_curriculum.json');

interface CurriculumStorageData {
  customTopics: Topic[];
  deletedTopicIds: string[];
  updatedAt: string;
}

function loadServerCurriculum(): CurriculumStorageData {
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
  } catch (err) {
    console.error('[API Curriculum] Failed to read storage file:', err);
  }

  return {
    customTopics: [],
    deletedTopicIds: [],
    updatedAt: new Date().toISOString()
  };
}

function saveServerCurriculum(data: CurriculumStorageData): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API Curriculum] Failed to write storage file:', err);
  }
}

export async function GET() {
  const data = loadServerCurriculum();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const topic = (await req.json()) as Topic;
    if (!topic || !topic.id || !topic.title) {
      return NextResponse.json({ error: 'Invalid topic payload' }, { status: 400 });
    }

    const current = loadServerCurriculum();
    
    // Filter out previous version of this topic
    const filtered = current.customTopics.filter((t) => t.id !== topic.id);
    filtered.push(topic);

    // If it was in deleted list, remove it
    const updatedDeleted = current.deletedTopicIds.filter((id) => id !== topic.id);

    const updatedData: CurriculumStorageData = {
      customTopics: filtered,
      deletedTopicIds: updatedDeleted,
      updatedAt: new Date().toISOString()
    };

    saveServerCurriculum(updatedData);

    return NextResponse.json({ success: true, topic, updatedAt: updatedData.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save topic' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing topic id' }, { status: 400 });
    }

    const current = loadServerCurriculum();
    const filteredTopics = current.customTopics.filter((t) => t.id !== id);
    const updatedDeleted = Array.from(new Set([...current.deletedTopicIds, id]));

    const updatedData: CurriculumStorageData = {
      customTopics: filteredTopics,
      deletedTopicIds: updatedDeleted,
      updatedAt: new Date().toISOString()
    };

    saveServerCurriculum(updatedData);

    return NextResponse.json({ success: true, deletedId: id, updatedAt: updatedData.updatedAt });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete topic' }, { status: 500 });
  }
}
