/**
 * Dashboard Portfolio Page
 *
 * Authenticated user's portfolio edit page.
 * Allows viewing and editing profile information.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPortfolioSettingsData } from '@/features/portfolio-settings/data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data';
import { DashboardPageLayout } from '@/features/tech';
import { getDisplayName, getInitials } from '@/features/dashboard/utils/userHelpers';
import { DashboardPortfolioView } from './DashboardPortfolioView';

export default async function DashboardPortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  await checkOnboarding(session.user.id);

  const [pageData, oauthImage, portfolioSettings] = await Promise.all([
    getDashboardPageData(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { oauthImage: true },
    }).then(u => u?.oauthImage ?? null),
    getPortfolioSettingsData(session.user.id),
  ]);

  const displayName = getDisplayName(pageData.user.name, pageData.user.email);
  const initials = getInitials(pageData.user.name, pageData.user.email);

  // Clean up invalid image URLs (empty strings, malformed URLs)
  const cleanImage = pageData.user.image?.trim() && pageData.user.image.trim() !== '' ? pageData.user.image.trim() : null;

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <DashboardPageLayout
      pageContext="portfolio"
      locale={locale}
      portfolioMode={pageData.user.portfolioMode}
      userName={displayName}
      userInitial={initials}
      userImage={pageData.user.image}
      level={pageData.stats.level}
      currentXP={pageData.stats.totalXP}
      maxXP={pageData.stats.nextLevelXP}
      streakDays={pageData.stats.currentStreak}
      activeSkillsCount={pageData.stats.activeSkillsCount}
      translations={{
        welcomeTitle: tDashboard('welcome', { name: displayName }),
        welcomeSubtitle: tDashboard('welcomeSubtitle'),
        streak: tWelcome('streak', { count: pageData.stats.currentStreak }),
        quickActionsTitle: tWelcome('quickActions'),
        xpToLevel: tWelcome('xpToLevel', {
          xp: pageData.stats.xpToNextLevel,
          level: pageData.stats.level + 1,
        }),
      }}
      bootStats={{
        totalXP: pageData.stats.totalXP,
        level: pageData.stats.level,
        activeSkillsCount: pageData.stats.activeSkillsCount,
        currentStreak: pageData.stats.currentStreak,
        achievements: pageData.stats.achievements,
      }}
    >
      <DashboardPortfolioView
        user={{
          id: pageData.user.id,
          name: pageData.user.name,
          email: pageData.user.email,
          username: pageData.user.username,
          image: cleanImage,
          bio: pageData.user.bio,
          portfolioMode: pageData.user.portfolioMode,
        }}
        oauthImage={oauthImage}
        portfolioSettings={portfolioSettings}
      />
    </DashboardPageLayout>
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'Edit Portfolio | Portfoland',
  description: 'Edit your public portfolio profile and settings.',
};
