/**
 * Get Top Runners (Global XP Leaderboard)
 *
 * Queries all users and computes their total XP using the same formula
 * as getUserDashboardStats, then returns the top 5 sorted by XP descending.
 * Results are cached for 5 minutes and tagged for cache invalidation.
 */

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { calculateMonthsDuration } from '@/features/skills/constants/xp'
import { GITHUB_XP_MULTIPLIER } from '@/features/github/constants/xp'

// =============================================================================
// Types
// =============================================================================

/**
 * A single user entry in the TopRunners leaderboard.
 * Matches the Runner interface in features/tech/types/dashboard.ts.
 */
export interface TopRunner {
  id: string
  name: string
  username: string | null
  image: string | null
  totalXP: number
  isCurrentUser: boolean
}

// =============================================================================
// XP Formula Constants
// Mirrors getUserDashboardStats for consistency
// =============================================================================

const PROJECT_XP = {
  COMPLETED: 300,
  IN_PROGRESS: 100,
  ARCHIVED: 50,
} as const

// =============================================================================
// Inner async function (wrapped by unstable_cache)
// =============================================================================

async function fetchTopRunners(currentUserId: string): Promise<TopRunner[]> {
  // Fetch all users with their XP-bearing relations in a single query
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      experiences: {
        select: { startDate: true, endDate: true },
      },
      projects: {
        select: { status: true },
      },
      userSkills: {
        select: { aiValidated: true, githubValidated: true, totalXP: true },
      },
    },
  })

  // Compute totalXP for each user using the same formula as getUserDashboardStats:
  //   Experience: 10 XP per month (min 1 month)
  //   Project: COMPLETED=300, IN_PROGRESS=100, ARCHIVED=50
  //   AI-validated skill: 150 XP base (heuristic fallback for zero totalXP)
  //   Manual skill: 50 XP base (heuristic fallback for zero totalXP)
  //   GitHub-validated skills: 1.3x multiplier applied at read time on top of base XP
  const runners: TopRunner[] = users.map((user) => {
    const experienceXP = user.experiences.reduce((sum, exp) => {
      const months = Math.max(1, calculateMonthsDuration(exp.startDate, exp.endDate ?? null))
      return sum + months * 10
    }, 0)

    const projectXP = user.projects.reduce((sum, project) => {
      const xp = PROJECT_XP[project.status as keyof typeof PROJECT_XP] ?? 0
      return sum + xp
    }, 0)

    const skillXP = user.userSkills.reduce((sum, userSkill) => {
      // Fall back to heuristic for older records where totalXP may be 0
      const base = userSkill.totalXP > 0 ? userSkill.totalXP : (userSkill.aiValidated ? 150 : 50)
      // Apply 1.3x multiplier at read time for GitHub-validated skills only
      const effective = userSkill.githubValidated
        ? Math.round(base * GITHUB_XP_MULTIPLIER)
        : base
      return sum + effective
    }, 0)

    const totalXP = experienceXP + projectXP + skillXP

    return {
      id: user.id,
      name: user.name ?? 'Anonymous',
      username: user.username,
      image: user.image,
      totalXP,
      isCurrentUser: user.id === currentUserId,
    }
  })

  // Sort by totalXP descending, take top 5
  runners.sort((a, b) => b.totalXP - a.totalXP)
  return runners.slice(0, 5)
}

// =============================================================================
// Exported cached function
// =============================================================================

/**
 * Returns the top 5 users by total XP with the current user marked.
 * Cached for 5 minutes; revalidated via "top-runners" tag.
 *
 * @param currentUserId - ID of the authenticated user (for isCurrentUser flag)
 * @returns Array of up to 5 TopRunner entries, sorted by XP descending
 */
export const getTopRunners = unstable_cache(
  fetchTopRunners,
  ["top-runners"],
  { tags: ["top-runners"], revalidate: 300 }
)
