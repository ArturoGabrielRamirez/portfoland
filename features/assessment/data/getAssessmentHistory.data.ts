/**
 * getAssessmentHistory — Per-skill summary stats for AssessmentWidget inline display.
 *
 * Returns a map of skillSlug → { bestScore, totalAttempts } so the widget
 * can show "Best: 80% | Attempts: 2" without a full history UI.
 */

import { prisma } from '@/lib/prisma';

export interface SkillAssessmentSummary {
  bestScore: number;
  totalAttempts: number;
}

/**
 * Fetch assessment summaries for a user, optionally scoped to specific skill slugs.
 *
 * Only completed assessments (PASSED or FAILED) are counted.
 * PENDING assessments (in-flight) are excluded.
 *
 * @param userId - The authenticated user's ID
 * @param skillSlugs - Optional list of slugs to filter; if omitted, fetches all
 * @returns Record keyed by skillSlug with bestScore and totalAttempts
 */
export async function getAssessmentHistoryData(
  userId: string,
  skillSlugs?: string[],
): Promise<Record<string, SkillAssessmentSummary>> {
  const assessments = await prisma.skillAssessment.findMany({
    where: {
      userId,
      status: { in: ['PASSED', 'FAILED'] },
      ...(skillSlugs?.length ? { skillSlug: { in: skillSlugs } } : {}),
    },
    select: {
      skillSlug: true,
      score: true,
    },
  });

  const result: Record<string, SkillAssessmentSummary> = {};

  for (const a of assessments) {
    const existing = result[a.skillSlug];
    const score = a.score ?? 0;
    if (!existing) {
      result[a.skillSlug] = { bestScore: score, totalAttempts: 1 };
    } else {
      result[a.skillSlug] = {
        bestScore: Math.max(existing.bestScore, score),
        totalAttempts: existing.totalAttempts + 1,
      };
    }
  }

  return result;
}
