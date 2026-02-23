/**
 * AI Content Types
 *
 * Type definitions for the AI content improvement feature.
 */

import type { Prisma } from '@/app/generated/prisma/client';

/**
 * Input for improving bio
 */
export interface ImproveBioInput {
  bio: string;
  mode?: string;
  locale?: string;
  additionalNotes?: string;
}

/**
 * Input for improving description
 */
export interface ImproveDescriptionInput {
  description: string;
  context: 'experience' | 'project';
  locale?: string;
  additionalNotes?: string;
}

/**
 * Result of content improvement
 */
export interface ImproveContentResult {
  improvedText: string;
  remainingLives: number;
}

/**
 * Experience data for calculating years
 */
export type ExperienceData = Prisma.ExperienceGetPayload<{
  select: {
    startDate: true;
    endDate: true;
  };
}>;

/**
 * Skill data for context
 */
export type SkillData = Prisma.UserSkillGetPayload<{
  include: {
    skill: {
      select: {
        name: true;
      };
    };
  };
}>;
