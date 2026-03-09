/**
 * Dashboard CV Generator Page
 *
 * Authenticated user's CV generation, analysis, and download.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { getCVsByUserId } from '@/features/cv/data/getCVs.data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data';
import { DashboardPageLayout } from '@/features/tech';
import { getDisplayName, getInitials } from '@/features/dashboard/utils/userHelpers';
import { CVGeneratorView } from '@/features/cv/components/CVGeneratorView';

export default async function DashboardCVPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  await checkOnboarding(session.user.id);

  const [pageData, savedCVs] = await Promise.all([
    getDashboardPageData(session.user.id),
    getCVsByUserId(session.user.id),
  ]);

  const displayName = getDisplayName(pageData.user.name, pageData.user.email);
  const initials = getInitials(pageData.user.name, pageData.user.email);

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <DashboardPageLayout
      pageContext="cv"
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
      <CVGeneratorView
        portfolioMode={pageData.user.portfolioMode}
        savedCVs={savedCVs}
        locale={locale}
        userId={pageData.user.id}
      />
    </DashboardPageLayout>
  );
}

export const metadata = {
  title: 'CV Generator | Portfoland',
  description: 'Generate, analyze, and download your CV.',
};
