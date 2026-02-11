/**
 * Public Timeline Page
 *
 * Displays a user's public timeline with experiences on a map.
 * Read-only view accessible without authentication.
 */

import { notFound } from 'next/navigation';
import { getPublicTimelineByUsername } from '@/features/timeline/data';
import { PublicTimelineView } from './PublicTimelineView';

interface PublicTimelinePageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function PublicTimelinePage({ params }: PublicTimelinePageProps) {
  const { username } = await params;

  // Fetch public timeline data
  const timelineData = await getPublicTimelineByUsername(username);

  // 404 if user not found
  if (!timelineData) {
    notFound();
  }

  return <PublicTimelineView data={timelineData} />;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PublicTimelinePageProps) {
  const { username } = await params;
  const timelineData = await getPublicTimelineByUsername(username);

  if (!timelineData) {
    return {
      title: 'Timeline Not Found',
    };
  }

  return {
    title: `${timelineData.user.name}'s Timeline | Portfoland`,
    description: `View ${timelineData.user.name}'s professional journey with ${timelineData.stats.totalExperiences} experiences and ${timelineData.stats.totalXP} XP.`,
  };
}
