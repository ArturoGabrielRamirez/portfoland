/**
 * Dashboard Services Page
 *
 * Authenticated user's service management with create, edit, and delete capabilities.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServicesByUserIdData } from '@/features/services/data';
import { DashboardServicesView } from './DashboardServicesView';

export default async function DashboardServicesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

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

  const services = await getServicesByUserIdData(session.user.id);

  return (
    <DashboardServicesView
      services={services}
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

export const metadata = {
  title: 'My Services | Portfoland',
  description: 'Manage your service offerings.',
};
