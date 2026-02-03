/**
 * Get Public Timeline by Username
 *
 * Retrieves a user's public timeline data by their username.
 * Used for the public /timeline/[username] page.
 */

import { prisma } from '@/lib/prisma';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { PublicTimelineData, TimelineStats } from '../types/experience';

/**
 * Get public timeline data for a username
 *
 * @param username - The user's username
 * @returns Public timeline data or null if user not found
 */
export async function getPublicTimelineByUsername(
  username: string
): Promise<PublicTimelineData | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      experiences: {
        orderBy: { startDate: 'desc' },
      },
    },
  });

  if (!user || !user.username) {
    return null;
  }

  // Calculate stats
  const stats = calculateStats(user.experiences);

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    },
    experiences: user.experiences,
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
