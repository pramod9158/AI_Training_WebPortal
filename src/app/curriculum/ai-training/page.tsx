import type { Metadata } from 'next';
import { ProgramCurriculumView } from '@/components/ProgramCurriculumView';

export const metadata: Metadata = {
  title: 'AI Training Curriculum | 4-Week GenAI & Agentic Systems & 3-Month Internship | Waynautic Academy',
  description: 'Detailed 26-session, 4-week AI Training curriculum covering Python, FastAPI, OpenAI, Claude, Gemini, Prompt Engineering, Vector DBs, RAG, MCP, ReAct Agents, 4 applied projects, and guaranteed 3-month industry internship.',
  keywords: [
    'AI Training Curriculum',
    'Generative AI Course',
    'RAG Architecture',
    'Model Context Protocol MCP',
    'Prompt Engineering',
    'Vector Databases',
    'ChromaDB',
    'Agentic AI',
    'Waynautic Academy',
    '3 Month Internship',
  ],
  openGraph: {
    title: 'AI Training Curriculum | Waynautic Academy',
    description: 'Master LLMs, Prompt Engineering, Vector DBs, RAG, and Agentic Workflows across 26 intensive sessions with a 3-month industry internship.',
    url: 'https://waynautic-academy.com/curriculum/ai-training',
    siteName: 'Waynautic Academy',
    type: 'website',
  },
};

export default function AITrainingCurriculumPage() {
  return <ProgramCurriculumView currentProgramId="ai-training" />;
}
