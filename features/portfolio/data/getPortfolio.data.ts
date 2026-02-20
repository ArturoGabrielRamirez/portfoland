/**
 * Get Portfolio by Username
 *
 * Aggregates user profile, experiences, skills, projects, services,
 * testimonials, gallery items, and portfolio settings for the public
 * portfolio page. All data fetches run in parallel via Promise.all.
 */

import { prisma } from '@/lib/prisma';
import { getPublicTimelineByUsername } from '@/features/timeline/data/getPublicTimeline.data';
import { getPublicSkillsByUsername } from '@/features/skills/data/getPublicSkills.data';
import { getPublicProjectsByUsername } from './getPublicProjects.data';
import { getPublicServicesByUsername } from './getPublicServices.data';
import { getPublicTestimonialsByUsername } from './getPublicTestimonials.data';
import { getPublicGalleryByUsername } from './getPublicGallery.data';
import { getPortfolioSettingsByUsername } from './getPortfolioSettings.data';
import type { PortfolioData, PortfolioMode } from '../types/portfolio';

/**
 * Get aggregated portfolio data for a username
 *
 * Fetches all portfolio sections in parallel: experiences, skills, projects
 * (Tech Mode) and services, testimonials, gallery, settings (Classic Mode).
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

  // Fetch all portfolio data in parallel — Tech Mode and Classic Mode fields
  const [
    experiences,
    skills,
    projects,
    services,
    testimonials,
    gallery,
    settings,
  ] = await Promise.all([
    getPublicTimelineByUsername(username),
    getPublicSkillsByUsername(username),
    getPublicProjectsByUsername(username),
    getPublicServicesByUsername(username),
    getPublicTestimonialsByUsername(username),
    getPublicGalleryByUsername(username),
    getPortfolioSettingsByUsername(username),
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
    services: services ?? [],
    testimonials: testimonials ?? [],
    gallery: gallery ?? [],
    settings: settings ?? null,
  };
}
