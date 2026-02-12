/**
 * Dashboard Projects Page
 *
 * Authenticated user's project management with create, edit, and delete capabilities.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getProjectsByUserIdData } from '@/features/projects/data';
import { DashboardProjectsView } from './DashboardProjectsView';

export default async function DashboardProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch user with complete data
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

  const projects = await getProjectsByUserIdData(session.user.id);

  return (
    <DashboardProjectsView
      projects={projects}
      user={{
        id: session.user.id,
        name: dbUser?.name ?? session.user.name ?? 'User',
        email: dbUser?.email ?? session.user.email,
        username: dbUser?.username || null,
        image: dbUser?.image ?? session.user.image ?? null,
        portfolioMode: dbUser?.portfolioMode ?? 'professional',
      }}
    />
  );
}

export const metadata = {
  title: 'My Projects | Portfoland',
  description: 'Manage your project showcase.',
};
