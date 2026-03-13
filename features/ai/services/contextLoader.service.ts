/**
 * Context Loader Service
 *
 * Aggregates a lightweight portfolio summary for injection into the AI
 * system prompt. Uses COUNT queries to keep latency low (~10ms total).
 */

import { prisma } from '@/lib/prisma'

// =============================================================================
// Types
// =============================================================================

export interface PortfolioSummary {
  name: string
  bio: string | null
  portfolioMode: string
  skillCount: number
  projectCount: number
  experienceCount: number
  hasGitHub: boolean
  githubSyncedAt: Date | null
  assessmentsPassed: number
  profileCompleteness: number
}

// =============================================================================
// Service
// =============================================================================

/**
 * Get a lightweight portfolio summary for a user.
 *
 * Runs a single user query plus 5 parallel COUNT queries via $transaction.
 *
 * @param userId - The authenticated user's ID
 * @returns Portfolio summary with counts and completeness score
 */
export async function getPortfolioSummary(
  userId: string,
): Promise<PortfolioSummary> {
  const [user, counts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        bio: true,
        image: true,
        username: true,
        portfolioMode: true,
        githubSyncedAt: true,
      },
    }),
    prisma.$transaction([
      prisma.userSkill.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.experience.count({ where: { userId } }),
      prisma.account.count({ where: { userId, providerId: 'github' } }),
      prisma.skillAssessment.count({ where: { userId, status: 'PASSED' } }),
    ]),
  ])

  const [skillCount, projectCount, experienceCount, githubCount, assessmentsPassed] = counts
  const hasGitHub = githubCount > 0

  const profileCompleteness = computeCompleteness({
    hasBio: !!user?.bio,
    hasImage: !!user?.image,
    hasUsername: !!user?.username,
    skillCount,
    projectCount,
    experienceCount,
    hasGitHub,
    assessmentsPassed,
  })

  return {
    name: user?.name ?? 'User',
    bio: user?.bio ?? null,
    portfolioMode: user?.portfolioMode ?? 'classic',
    skillCount,
    projectCount,
    experienceCount,
    hasGitHub,
    githubSyncedAt: user?.githubSyncedAt ?? null,
    assessmentsPassed,
    profileCompleteness,
  }
}

// =============================================================================
// Completeness
// =============================================================================

interface CompletenessInput {
  hasBio: boolean
  hasImage: boolean
  hasUsername: boolean
  skillCount: number
  projectCount: number
  experienceCount: number
  hasGitHub: boolean
  assessmentsPassed: number
}

/**
 * Compute profile completeness as a weighted percentage (0-100).
 *
 * Weights:
 * - Has bio: 15%
 * - Has image: 10%
 * - Has username: 10%
 * - Skills >= 5: 15%
 * - Projects >= 2: 15%
 * - Experiences >= 1: 10%
 * - GitHub connected: 10%
 * - Assessment passed >= 1: 15%
 */
function computeCompleteness(input: CompletenessInput): number {
  let score = 0

  if (input.hasBio) score += 15
  if (input.hasImage) score += 10
  if (input.hasUsername) score += 10
  if (input.skillCount >= 5) score += 15
  if (input.projectCount >= 2) score += 15
  if (input.experienceCount >= 1) score += 10
  if (input.hasGitHub) score += 10
  if (input.assessmentsPassed >= 1) score += 15

  return score
}

// =============================================================================
// Prompt Formatter
// =============================================================================

/**
 * Format a portfolio summary into a concise text block for system prompt injection.
 *
 * @param summary - The portfolio summary to format
 * @returns Text block (~50 tokens) for system prompt
 */
export function formatSummaryForPrompt(summary: PortfolioSummary): string {
  const githubLine = summary.hasGitHub
    ? `Connected, last synced ${summary.githubSyncedAt?.toLocaleDateString() ?? 'unknown'}`
    : 'Not connected'

  return `
USER PORTFOLIO SUMMARY:
- Name: ${summary.name}
- Bio: ${summary.bio ? 'Set' : 'Not set'}
- Mode: ${summary.portfolioMode}
- Skills: ${summary.skillCount}, Projects: ${summary.projectCount}, Experiences: ${summary.experienceCount}
- GitHub: ${githubLine}
- Assessments passed: ${summary.assessmentsPassed}
- Profile completeness: ${summary.profileCompleteness}%
`.trim()
}
