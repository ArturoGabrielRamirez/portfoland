/**
 * AI Narrator Types
 *
 * Type definitions for the AI portfolio narrator feature.
 */

import type { Prisma } from '@/app/generated/prisma/client';

/**
 * Input for generating narrative
 */
export interface GenerateNarrativeInput {
  username: string;
  mode?: string;
  locale?: string;
}

/**
 * Data retrieved for narrative generation
 */
export interface NarrativeUserData {
  name: string;
  bio: string | null;
  skills: Array<{
    name: string;
    level: number;
    category: string;
  }>;
  experiences: Array<{
    title: string;
    company: string;
    type: string;
    startDate: Date;
    endDate: Date | null;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
}

/**
 * Narrative result
 */
export interface NarrativeResult {
  narrative: string;
  cached: boolean;
}

/**
 * Cache metadata stored in user meta
 */
export interface NarrativeCacheEntry {
  narrative: string;
  timestamp: string;
}

/**
 * UserSkill with computed self-assessment level
 * This extends the Prisma type to include computed fields
 */
export interface UserSkillWithSelfAssessment {
  skillId: string;
  skillName: string;
  categoryName: string;
  totalXP: number;
  level: number;
  selfAssessmentLevel?: string;
}

/**
 * Public portfolio data for narrative (without userId)
 */
export type NarrativeUserDataPayload = Prisma.UserGetPayload<{
  select: {
    name: true;
    bio: true;
    userSkills: {
      include: {
        skill: {
          include: {
            category: true;
          };
        };
      };
      orderBy: { totalXP: 'desc' };
      take: 10;
    };
    experiences: {
      orderBy: { startDate: 'desc' };
      take: 5;
      select: {
        title: true;
        company: true;
        type: true;
        startDate: true;
        endDate: true;
      };
    };
    projects: {
      where: { status: 'COMPLETED' };
      orderBy: { createdAt: 'desc' };
      take: 3;
      select: {
        title: true;
        description: true;
        technologies: true;
      };
    };
  };
}>;
