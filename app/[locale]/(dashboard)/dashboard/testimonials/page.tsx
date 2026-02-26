/**
 * Dashboard Testimonials Page
 *
 * Authenticated user's testimonial management with create, edit, and delete capabilities.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTestimonialsByUserIdData } from '@/features/testimonials/data';
import { DashboardTestimonialsView } from './DashboardTestimonialsView';

export default async function DashboardTestimonialsPage() {
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

  const testimonials = await getTestimonialsByUserIdData(session.user.id);

  return (
    <DashboardTestimonialsView
      testimonials={testimonials}
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
  title: 'My Testimonials | Portfoland',
  description: 'Manage your client testimonials.',
};
