import type { Metadata } from 'next';
import { MODULES } from '@/data/seedModules';
import { getTopicBySlugs } from '@/lib/curriculumService';
import { TopicWorkspaceClient } from '@/components/TopicWorkspaceClient';

interface PageProps {
  params: Promise<{ moduleSlug: string; topicSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const moduleData = MODULES.find((m) => m.slug === resolvedParams.moduleSlug);
  const topic = getTopicBySlugs(resolvedParams.moduleSlug, resolvedParams.topicSlug);

  if (!moduleData || !topic) {
    return {
      title: 'Topic Not Found | Waynautic AI Academy',
      description: 'The requested learning topic could not be found.',
    };
  }

  const title = `${topic.title} - ${moduleData.title} | Waynautic AI Academy`;
  const description = topic.description || `Learn ${topic.title} in ${moduleData.title}. Video lectures, code notes, and interactive quizzes.`;
  const url = `https://waynautic-academy.com/curriculum/${resolvedParams.moduleSlug}/${resolvedParams.topicSlug}`;

  return {
    title,
    description,
    keywords: [topic.title, moduleData.title, 'AI Engineering', 'LLMs', 'Waynautic Academy', 'Course'],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Waynautic AI Academy',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function TopicWorkspacePage() {
  return <TopicWorkspaceClient />;
}
