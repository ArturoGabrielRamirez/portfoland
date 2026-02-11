/**
 * Get Experiences by User ID
 *
 * Retrieves all experiences for a user, ordered by start date descending.
 * Also calculates aggregated stats (total XP, counts by type).
 */

import { prisma } from '@/lib/prisma';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { TimelineData, TimelineStats } from '../types/experience';

/**
 * Get all experiences for a user with calculated stats
 *
 * @param userId - The user's ID
 * @returns Timeline data with experiences and stats
 */
export async function getExperiencesByUserId(userId: string): Promise<TimelineData> {
  const experiences = await prisma.experience.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });

  // Calculate stats
  const stats = calculateStats(experiences);

  return {
    experiences,
    stats,
  };
}

/**
 * Calculate timeline stats from experiences
 */
function calculateStats(
  experiences: Array<{ type: ExperienceType; xp: number }>
): TimelineStats {
  const countByType: Record<ExperienceType, number> = {
    WORK: 0,
    EDUCATION: 0,
    PROJECT: 0,
    CERTIFICATION: 0,
  };

  let totalXP = 0;

  for (const exp of experiences) {
    totalXP += exp.xp;
    countByType[exp.type]++;
  }

  // Calculate milestones (every 1000 XP is a milestone)
  const milestones = Math.floor(totalXP / 1000);

  // Achievements based on variety and count
  const typesWithExperiences = Object.values(countByType).filter((c) => c > 0).length;
  const achievements = typesWithExperiences + Math.floor(experiences.length / 5);

  return {
    totalXP,
    totalExperiences: experiences.length,
    countByType,
    milestones,
    achievements,
  };
}
