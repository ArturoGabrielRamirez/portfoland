/**
 * Dashboard Skills Page
 *
 * Authenticated user's skill tree with editing capabilities.
 * Allows viewing, adding, and managing skills.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations, getMessages } from 'next-intl/server';

import { auth } from '@/lib/auth';
import { getUserSkillsData, getSkillCategoriesData } from '@/features/skills/data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';
import { ASSESSMENT_SUPPORTED_SKILL_SLUGS } from '@/features/assessment/constants/supportedSkills';
import { getAssessmentHistoryData } from '@/features/assessment/data/getAssessmentHistory.data';
import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';
import { getDashboardPageData } from '@/features/dashboard/data/getDashboardPageData.data';
import { DashboardPageLayout } from '@/features/tech';
import { getDisplayName, getInitials } from '@/features/dashboard/utils/userHelpers';
import { DashboardSkillsView } from './DashboardSkillsView';
import { SkillsIntlProvider } from './SkillsIntlProvider';

export default async function DashboardSkillsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  await checkOnboarding(session.user.id);

  // Fetch shared page data + skills + categories + github status in parallel
  const [pageData, skills, categories, githubStatus] = await Promise.all([
    getDashboardPageData(session.user.id),
    getUserSkillsData(session.user.id).catch(() => []),
    getSkillCategoriesData(session.user.id).catch(() => []),
    getGitHubConnectionStatus(session.user.id),
  ]);

  // Parse assessment tokens from User.meta — need a separate fetch for meta field
  // since getDashboardPageData doesn't include it
  const { prisma } = await import('@/lib/prisma');
  const userMeta = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { meta: true },
  });

  const todayISO = new Date().toISOString().split('T')[0];
  const assessmentTokens: AssessmentTokenInfo =
    (userMeta?.meta as { assessmentTokens?: AssessmentTokenInfo } | null)?.assessmentTokens ??
    { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: todayISO };

  // Filter skills to those eligible for assessment
  const supportedUserSkills = skills.filter((s) =>
    ASSESSMENT_SUPPORTED_SKILL_SLUGS.includes(s.skill?.slug ?? ''),
  );

  // Fetch per-skill assessment history (best score + attempt count) for inline display
  const supportedSlugs = supportedUserSkills.map((s) => s.skill?.slug ?? '').filter(Boolean);
  const assessmentHistory = supportedSlugs.length
    ? await getAssessmentHistoryData(session.user.id, supportedSlugs)
    : {};

  // Calculate stats
  const totalSkills = skills.length;
  const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);
  const masterSkills = skills.filter((s) => s.level === 5).length;
  const categoriesUsed = new Set(skills.map((s) => s.skill.categoryId)).size;

  const displayName = getDisplayName(pageData.user.name, pageData.user.email);
  const initials = getInitials(pageData.user.name, pageData.user.email);

  const tWelcome = await getTranslations({ locale, namespace: 'dashboard.welcomeCard' });
  const tDashboard = await getTranslations({ locale, namespace: 'dashboard' });
  const messages = await getMessages();

  return (
    <DashboardPageLayout
      pageContext="skills"
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
      <SkillsIntlProvider locale={locale} messages={messages}>
        <DashboardSkillsView
          skills={skills}
          categories={categories}
          stats={{
            totalSkills,
            totalXP,
            masterSkills,
            categoriesUsed,
          }}
          user={{
            id: pageData.user.id,
            name: pageData.user.name,
            email: pageData.user.email,
            username: pageData.user.username,
            image: pageData.user.image,
            portfolioMode: pageData.user.portfolioMode,
          }}
          githubSyncedAt={githubStatus.syncedAt}
          githubStats={githubStatus.stats}
          isGitHubConnected={githubStatus.isConnected}
          assessmentTokens={assessmentTokens}
          supportedUserSkills={supportedUserSkills}
          assessmentHistory={assessmentHistory}
        />
      </SkillsIntlProvider>
    </DashboardPageLayout>
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'My Skill Tree | Portfoland',
  description: 'View and manage your professional skills with an interactive skill tree.',
};
