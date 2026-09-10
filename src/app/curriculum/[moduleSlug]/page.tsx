import type { Metadata } from 'next';
import { MODULES } from '@/data/seedModules';
import { ModuleClient } from '@/components/ModuleClient';

interface PageProps {
  params: Promise<{ moduleSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const moduleData = MODULES.find((m) => m.slug === resolvedParams.moduleSlug);

  if (!moduleData) {
    return {
      title: 'Module Not Found | Waynautic AI Academy',
      description: 'The requested learning module could not be found.',
    };
  }

  const title = `Module 0${moduleData.orderIndex}: ${moduleData.title} | Waynautic AI Academy`;
  const description = moduleData.description || `Master ${moduleData.title} with video lectures, code notes, and interactive quizzes.`;
  const url = `https://waynautic-academy.com/curriculum/${resolvedParams.moduleSlug}`;

  return {
    title,
    description,
    keywords: [moduleData.title, 'AI Engineering', 'LLMs', 'Waynautic Academy', moduleData.difficulty],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Waynautic AI Academy',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function ModulePage() {
  return <ModuleClient />;
}
