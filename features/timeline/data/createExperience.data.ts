/**
 * Create Experience
 *
 * Creates a new experience with auto-calculated XP based on type.
 */

import { prisma } from '@/lib/prisma';
import type { ExperienceType } from '@/app/generated/prisma/enums';
import type { Experience } from '../types/experience';
import { calculateXP } from '../constants/xp';

/**
 * Input for creating an experience at the data layer
 */
export interface CreateExperienceData {
  userId: string;
  type: ExperienceType;
  title: string;
  company: string;
  latitude: number;
  longitude: number;
  address: string;
  startDate: Date;
  endDate?: Date | null;
  description: string;
  skills?: string[];
}

/**
 * Create a new experience
 *
 * XP is automatically calculated based on the experience type.
 *
 * @param data - The experience data
 * @returns The created experience
 */
export async function createExperience(data: CreateExperienceData): Promise<Experience> {
  const xp = calculateXP(data.type);

  const experience = await prisma.experience.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      company: data.company,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      description: data.description,
      skills: data.skills ?? [],
      xp,
    },
  });

  return experience;
}
