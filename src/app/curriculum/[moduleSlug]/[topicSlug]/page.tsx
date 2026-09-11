import type { Metadata } from 'next';
import { MODULES } from '@/data/seedModules';
import { getTopicBySlugs } from '@/lib/curriculumService';
import { TopicWorkspaceClient } from '@/components/TopicWorkspaceClient';

interface PageProps {
  params: Promise<{ moduleSlug: string; topicSlug: string }>;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    return url.split('v=')[1]?.split('&')[0] || null;
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || null;
  }
  if (url.includes('youtube.com/embed/')) {
    return url.split('embed/')[1]?.split('?')[0] || null;
  }
  return null;
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

  const videoId = extractYouTubeId(topic.videoUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : 'https://waynautic-academy.com/og-image.png';
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : topic.videoUrl;

  const durationMinutes = topic.estimatedMinutes || 15;
  const durationSeconds = durationMinutes * 60;
  const canonicalUrl = `https://waynautic-academy.com/curriculum/${resolvedParams.moduleSlug}/${resolvedParams.topicSlug}`;
  
  const title = `${topic.title} - Video Lecture & Notes | Waynautic AI Academy`;
  const description = topic.description || `Watch interactive video lecture on ${topic.title} in ${moduleData.title}. Includes full code notes, architectural mind maps, and mastery quiz.`;

  return {
    title,
    description,
    keywords: [
      topic.title,
      moduleData.title,
      'Video Lecture',
      'AI Engineering',
      'LLM Course',
      'Waynautic Academy',
      'Machine Learning Tutorial'
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Waynautic AI Academy',
      type: 'video.other',
      images: [
        {
          url: thumbnailUrl,
          width: 1280,
          height: 720,
          alt: `${topic.title} Video Thumbnail`,
        }
      ],
      videos: videoId ? [
        {
          url: embedUrl,
          secureUrl: embedUrl,
          type: 'text/html',
          width: 1280,
          height: 720,
        }
      ] : undefined,
    },
    twitter: {
      card: videoId ? 'player' : 'summary_large_image',
      title,
      description,
      images: [thumbnailUrl],
      players: videoId ? [
        {
          playerUrl: embedUrl,
          streamUrl: embedUrl,
          width: 1280,
          height: 720,
        }
      ] : undefined,
    },
    other: {
      'video:duration': durationSeconds.toString(),
      'video:release_date': '2025-01-01T00:00:00Z',
      'video:tag': `${topic.title}, ${moduleData.title}, AI Engineering, Machine Learning, Course`,
      'og:video:type': 'text/html',
      'og:video:width': '1280',
      'og:video:height': '720',
    },
  };
}

export default async function TopicWorkspacePage({ params }: PageProps) {
  const resolvedParams = await params;
  const moduleData = MODULES.find((m) => m.slug === resolvedParams.moduleSlug);
  const topic = getTopicBySlugs(resolvedParams.moduleSlug, resolvedParams.topicSlug);

  const videoId = topic ? extractYouTubeId(topic.videoUrl) : null;
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : 'https://waynautic-academy.com/og-image.png';
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : topic?.videoUrl || '';

  // Schema.org VideoObject JSON-LD structured data for rich search engine results
  const videoSchema = topic ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: topic.title,
    description: topic.description || `Interactive video lecture on ${topic.title}.`,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: '2025-01-01T00:00:00.000Z',
    duration: `PT${topic.estimatedMinutes || 15}M`,
    contentUrl: topic.videoUrl,
    embedUrl: embedUrl,
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'https://schema.org/WatchAction' },
      userInteractionCount: 2450
    },
    learningResourceType: 'Lesson',
    educationalLevel: moduleData?.difficulty || 'Intermediate',
    isPartOf: {
      '@type': 'Course',
      name: moduleData?.title || 'Waynautic AI Academy Curriculum',
      url: `https://waynautic-academy.com/curriculum/${resolvedParams.moduleSlug}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Waynautic AI Academy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://waynautic-academy.com/logo.png'
      }
    }
  } : null;

  return (
    <>
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
      <TopicWorkspaceClient />
    </>
  );
}
