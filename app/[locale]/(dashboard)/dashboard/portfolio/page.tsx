/**
 * Dashboard Portfolio Page
 *
 * Authenticated user's portfolio edit page.
 * Allows viewing and editing profile information.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardPortfolioView } from './DashboardPortfolioView';

export default async function DashboardPortfolioPage() {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      redirect('/login');
    }

    // Fetch user with complete profile data
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        oauthImage: true,
        bio: true,
        portfolioMode: true,
      },
    });

    if (!dbUser) {
      redirect('/login');
    }

    // Get OAuth image - use the one from DB if exists, otherwise null
    // (will be set on next fresh login from OAuth provider)
    const oauthImage = dbUser.oauthImage ?? null;

    // Clean up invalid image URLs (empty strings, malformed URLs)
    const cleanImage = dbUser.image?.trim() && dbUser.image.trim() !== '' ? dbUser.image.trim() : null;

    return (
      <DashboardPortfolioView
        user={{
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          username: dbUser.username || null,
          image: cleanImage,
          bio: dbUser.bio ?? null,
          portfolioMode: (dbUser.portfolioMode ?? 'professional') as 'professional' | 'gaming',
        }}
        oauthImage={oauthImage}
      />
    );
  } catch (error) {
    console.error('Error in DashboardPortfolioPage:', error);
    throw error;
  }
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'Edit Portfolio | Portfoland',
  description: 'Edit your public portfolio profile and settings.',
};
