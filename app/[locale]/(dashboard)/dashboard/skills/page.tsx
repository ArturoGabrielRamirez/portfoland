/**
 * Dashboard Skills Page
 *
 * Authenticated user's skill tree with editing capabilities.
 * Allows viewing, adding, and managing skills.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserSkillsData, getSkillCategoriesData } from '@/features/skills/data';
import { checkOnboarding } from '@/features/onboarding/utils/checkOnboarding';
import { getGitHubConnectionStatus } from '@/features/github/data/getGitHubConnectionStatus.data';
import { DEFAULT_ASSESSMENT_TOKENS } from '@/features/assessment/constants/tokens';
import { ASSESSMENT_SUPPORTED_SKILL_SLUGS } from '@/features/assessment/constants/supportedSkills';
import type { AssessmentTokenInfo } from '@/features/assessment/types/assessment';
import { DashboardSkillsView } from './DashboardSkillsView';

export default async function DashboardSkillsPage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  await checkOnboarding(session.user.id);

  // Fetch user with complete data — includes GitHub sync fields and meta for assessment tokens
  const [dbUser, githubStatus] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        portfolioMode: true,
        githubSyncedAt: true,
        githubStats: true,
        meta: true,
      },
    }),
    getGitHubConnectionStatus(session.user.id),
  ]);

  // Fetch user's skills and categories data
  const [skills, categories] = await Promise.all([
    getUserSkillsData(session.user.id).catch(() => []),
    getSkillCategoriesData(session.user.id).catch(() => []),
  ]);

  // Parse assessment tokens from User.meta — fall back to defaults if absent
  const todayISO = new Date().toISOString().split('T')[0];
  const assessmentTokens: AssessmentTokenInfo =
    (dbUser?.meta as { assessmentTokens?: AssessmentTokenInfo } | null)?.assessmentTokens ??
    { remaining: DEFAULT_ASSESSMENT_TOKENS, lastResetDate: todayISO };

  // Filter skills to those eligible for assessment
  const supportedUserSkills = skills.filter((s) =>
    ASSESSMENT_SUPPORTED_SKILL_SLUGS.includes(s.skill?.slug ?? ''),
  );

  // Calculate stats
  const totalSkills = skills.length;
  const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);
  const masterSkills = skills.filter((s) => s.level === 5).length;
  const categoriesUsed = new Set(skills.map((s) => s.skill.categoryId)).size;

  return (
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
        id: session.user.id,
        name: dbUser?.name ?? session.user.name ?? 'User',
        email: dbUser?.email ?? session.user.email,
        username: dbUser?.username || null,
        image: dbUser?.image ?? session.user.image ?? null,
        portfolioMode: (dbUser?.portfolioMode ?? 'classic') as 'classic' | 'tech',
      }}
      githubSyncedAt={githubStatus.syncedAt}
      githubStats={githubStatus.stats}
      isGitHubConnected={githubStatus.isConnected}
      assessmentTokens={assessmentTokens}
      supportedUserSkills={supportedUserSkills}
    />
  );
}

/**
 * Page metadata
 */
export const metadata = {
  title: 'My Skill Tree | Portfoland',
  description: 'View and manage your professional skills with an interactive skill tree.',
};
