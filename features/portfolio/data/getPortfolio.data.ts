/**
 * Get Portfolio by Username
 *
 * Aggregates user profile, experiences, skills, and projects
 * for the public portfolio page.
 */

import { prisma } from '@/lib/prisma';
import { getPublicTimelineByUsername } from '@/features/timeline/data/getPublicTimeline.data';
import { getPublicSkillsByUsername } from '@/features/skills/data/getPublicSkills.data';
import { getPublicProjectsByUsername } from './getPublicProjects.data';
import type { PortfolioData, PortfolioMode } from '../types/portfolio';

/**
 * Get aggregated portfolio data for a username
 *
 * @param username - The user's username
 * @returns Aggregated portfolio data or null if user not found
 */
export async function getPortfolioByUsername(
  username: string
): Promise<PortfolioData | null> {
  // First check if user exists with required fields
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      bio: true,
      portfolioMode: true,
      locale: true,
      sectionOrder: true,
      contactLinks: true,
      sectionVisibility: true,
    },
  });

  if (!user || !user.username) {
    return null;
  }

  // Fetch experiences, skills, and projects in parallel
  const [experiences, skills, projects] = await Promise.all([
    getPublicTimelineByUsername(username),
    getPublicSkillsByUsername(username),
    getPublicProjectsByUsername(username),
  ]);

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio,
      portfolioMode: user.portfolioMode as PortfolioMode,
      locale: user.locale,
      sectionOrder: user.sectionOrder,
      contactLinks: user.contactLinks as Record<string, any>,
      sectionVisibility: user.sectionVisibility as Record<string, boolean>,
    },
    experiences,
    skills,
    projects: projects ?? [],
  };
}
