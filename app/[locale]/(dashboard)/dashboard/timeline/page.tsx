/**
 * Dashboard Timeline Page
 *
 * Authenticated user's timeline with editing capabilities.
 * Allows creating, editing, and deleting experiences.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getExperiencesByUserId } from '@/features/timeline/data';
import { DashboardTimelineView } from './DashboardTimelineView';

export default async function DashboardTimelinePage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch user's timeline data
  const timelineData = await getExperiencesByUserId(session.user.id);

  return (
    <DashboardTimelineView
      data={timelineData}
      user={{
        id: session.user.id,
        name: session.user.name,
        username: (session.user as { username?: string }).username || null,
      }}
    />
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'My Timeline | Portfoland',
  description: 'Manage your professional timeline and experiences.',
};
