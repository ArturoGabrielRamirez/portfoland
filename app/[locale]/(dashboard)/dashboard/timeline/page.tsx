/**
 * Dashboard Timeline Page
 *
 * Authenticated user's timeline with editing capabilities.
 * Allows creating, editing, and deleting experiences.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getExperiencesByUserId } from '@/features/timeline/data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { DashboardTimelineView } from './DashboardTimelineView';

export default async function DashboardTimelinePage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  await checkOnboarding(session.user.id);

  // Fetch user with image, username, and portfolioMode
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      portfolioMode: true,
    },
  });

  // Fetch user's timeline data
  const timelineData = await getExperiencesByUserId(session.user.id);

  return (
    <DashboardTimelineView
      data={timelineData}
      user={{
        id: session.user.id,
        name: dbUser?.name ?? session.user.name ?? 'User',
        email: dbUser?.email ?? session.user.email,
        username: dbUser?.username || null,
        image: dbUser?.image ?? session.user.image ?? null,
        portfolioMode: (dbUser?.portfolioMode ?? 'classic') as 'classic' | 'tech',
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
