/**
 * Dashboard Testimonials Page
 *
 * Authenticated user's testimonial management with create, edit, and delete capabilities.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { getTestimonialsByUserIdData } from '@/features/testimonials/data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data';
import { DashboardPageLayout } from '@/features/tech';
import { getDisplayName, getInitials } from '@/features/dashboard/utils/userHelpers';
import { DashboardTestimonialsView } from './DashboardTestimonialsView';

export default async function DashboardTestimonialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  await checkOnboarding(session.user.id);

  const [pageData, testimonials] = await Promise.all([
    getDashboardPageData(session.user.id),
    getTestimonialsByUserIdData(session.user.id),
  ]);

  const displayName = getDisplayName(pageData.user.name, pageData.user.email);
  const initials = getInitials(pageData.user.name, pageData.user.email);

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <DashboardPageLayout
      pageContext="testimonials"
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
      <DashboardTestimonialsView
        testimonials={testimonials}
        user={{
          id: pageData.user.id,
          name: pageData.user.name,
          email: pageData.user.email,
          username: pageData.user.username,
          image: pageData.user.image,
          portfolioMode: pageData.user.portfolioMode,
        }}
      />
    </DashboardPageLayout>
  );
}

export const metadata = {
  title: 'My Testimonials | Portfoland',
  description: 'Manage your client testimonials.',
};
