/**
 * Get Dashboard Stats by User ID
 *
 * Computes real XP, level, achievements, and streak for the Tech Mode
 * dashboard from the user's experiences, projects, and AI-validated skills.
 * Results are cached per-user and invalidated by tag on content mutations.
 */

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { calculateMonthsDuration } from '@/features/skills/constants/xp';
import type { DashboardStats } from '@/features/dashboard/types/dashboard';

// =============================================================================
// Constants
// =============================================================================

const PROJECT_XP = {
  COMPLETED: 300,
  IN_PROGRESS: 100,
  ARCHIVED: 50,
} as const;

// =============================================================================
// Inner fetch function (wrapped by unstable_cache below)
// =============================================================================

/**
 * Fetch and compute dashboard stats for a user.
 * Uses a single Prisma query to retrieve all required data.
 */
async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      bio: true,
      image: true,
      username: true,
      currentStreak: true,
      experiences: {
        select: { startDate: true, endDate: true },
      },
      projects: {
        select: { status: true },
      },
      userSkills: {
        where: { aiValidated: true },
        select: { totalXP: true },
      },
      _count: {
        select: { conversations: true },
      },
    },
  });

  // ---------------------------------------------------------------------------
  // XP computation
  // ---------------------------------------------------------------------------

  // Experience XP: 10 XP per month of duration (minimum 1 month)
  const experienceXPs = user.experiences.map((exp) =>
    Math.max(1, calculateMonthsDuration(exp.startDate, exp.endDate ?? null)) * 10
  );

  // Project XP: fixed amounts by status
  const projectXPs = user.projects.map(
    (project) => PROJECT_XP[project.status as keyof typeof PROJECT_XP] ?? 0
  );

  // Skill XP: only AI-validated skills; use stored totalXP directly
  const skillXPs = user.userSkills.map((skill) => skill.totalXP);

  const totalXP =
    experienceXPs.reduce((sum, xp) => sum + xp, 0) +
    projectXPs.reduce((sum, xp) => sum + xp, 0) +
    skillXPs.reduce((sum, xp) => sum + xp, 0);

  // ---------------------------------------------------------------------------
  // Level computation
  // ---------------------------------------------------------------------------

  const level = Math.floor(Math.sqrt(totalXP / 100));
  const currentLevelXP = level * level * 100;
  const nextLevelXP = (level + 1) * (level + 1) * 100;
  const xpToNextLevel = nextLevelXP - totalXP;

  // ---------------------------------------------------------------------------
  // Achievement computation (computed inline — no DB writes)
  // ---------------------------------------------------------------------------

  // Achievement 1 — Profile Complete
  const check1 = user.bio != null && user.image != null && user.username != null;

  // Achievement 2 — First AI-Validated Skill (query already filtered to aiValidated: true)
  const check2 = user.userSkills.length > 0;

  // Achievement 3 — AI Survivor (at least one conversation exists)
  const check3 = user._count.conversations > 0;

  const achievementsCurrent = [check1, check2, check3].filter(Boolean).length;

  return {
    totalXP,
    level,
    xpToNextLevel,
    currentLevelXP,
    nextLevelXP,
    experiencesCount: user.experiences.length,
    achievements: { current: achievementsCurrent, total: 3 },
    currentStreak: user.currentStreak,
  };
}

// =============================================================================
// Exported cached function
// =============================================================================

/**
 * Get computed dashboard stats for a user, with per-user cache tagging.
 * Cache is invalidated via revalidateTag(`user-stats-${userId}`) in mutations.
 *
 * @param userId - The authenticated user's ID
 * @returns Computed DashboardStats
 */
export function getUserDashboardStats(userId: string): Promise<DashboardStats> {
  return unstable_cache(
    fetchDashboardStats,
    ['user-dashboard-stats', userId],
    { tags: [`user-stats-${userId}`] }
  )(userId);
}
