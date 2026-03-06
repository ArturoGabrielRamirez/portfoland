/**
 * Apply Assessment Rewards Service
 *
 * Called by scoreAssessmentService when a user passes an assessment.
 * Sets `aiAssessmentValidated = true` on the UserSkill, creates a new
 * MANUAL SkillSource worth 200 XP, and recalculates the UserSkill level.
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';
import { calculateLevelFromXP } from '@/features/skills/constants/xp';

// =============================================================================
// Constants
// =============================================================================

/** XP granted for passing an AI assessment */
const ASSESSMENT_XP_REWARD = 200;

// =============================================================================
// Service function
// =============================================================================

/**
 * Apply post-assessment rewards to a user's skill.
 *
 * Operations (all within a single transaction):
 * 1. Fetch the UserSkill's current totalXP
 * 2. Create a new MANUAL SkillSource with xpAmount = 200 and metadata identifying
 *    it as an AI assessment reward
 * 3. Update UserSkill.totalXP += 200, recalculate level, set aiAssessmentValidated = true
 *
 * @param userId - Owning user's ID (used for the update where clause scope)
 * @param userSkillId - The UserSkill to reward
 * @param score - The assessment score (0-100) stored in the source metadata
 */
export async function applyAssessmentRewardsService(
  userId: string,
  userSkillId: string,
  score: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Fetch current XP so we can compute the new total
    const userSkill = await tx.userSkill.findUnique({
      where: { id: userSkillId },
      select: { totalXP: true },
    });

    if (!userSkill) {
      throw new Error('UserSkill not found when applying assessment rewards.');
    }

    const newTotalXP = userSkill.totalXP + ASSESSMENT_XP_REWARD;
    const newLevel = calculateLevelFromXP(newTotalXP);

    // Create the new SkillSource record documenting the reward
    const sourceMetadata: Prisma.InputJsonValue = {
      source: 'ai_assessment',
      score,
    };

    await tx.skillSource.create({
      data: {
        userSkillId,
        sourceType: 'MANUAL',
        xpAmount: ASSESSMENT_XP_REWARD,
        metadata: sourceMetadata,
      },
    });

    // Update the UserSkill — set validated flag and new XP/level
    await tx.userSkill.update({
      where: { id: userSkillId },
      data: {
        aiAssessmentValidated: true,
        totalXP: newTotalXP,
        level: newLevel,
      },
    });
  });
}
