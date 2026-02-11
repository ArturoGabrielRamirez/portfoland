/**
 * Dashboard Projects Page
 *
 * Authenticated user's project management with create, edit, and delete capabilities.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getProjectsByUserIdData } from '@/features/projects/data';
import { DashboardProjectsView } from './DashboardProjectsView';

export default async function DashboardProjectsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  const projects = await getProjectsByUserIdData(session.user.id);

  return <DashboardProjectsView projects={projects} />;
}

export const metadata = {
  title: 'My Projects | Portfoland',
  description: 'Manage your project showcase.',
};
