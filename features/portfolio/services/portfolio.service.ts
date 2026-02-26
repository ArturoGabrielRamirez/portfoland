/**
 * Portfolio Service Layer
 *
 * Business logic for portfolio operations.
 * Validates business rules and orchestrates data layer calls.
 */

import { PORTFOLIO_MODES, PORTFOLIO_MESSAGES } from '../constants/messages';
import { updatePortfolioModeData } from '../data/updatePortfolioMode.data';
import { TECH_DEFAULT_SECTIONS, CLASSIC_DEFAULT_SECTIONS } from '../constants/sections';
import { updateUserProfileData } from '../data/updateProfile.data';
import { invalidateNarrativeCache } from '@/features/ai-narrator';

const VALID_MODES = [PORTFOLIO_MODES.CLASSIC, PORTFOLIO_MODES.TECH];

/**
 * Update a user's portfolio mode
 *
 * Validates the mode value and delegates to the data layer.
 *
 * @param userId - The user's ID
 * @param mode - The new portfolio mode value
 * @returns Updated user record
 * @throws Error if mode is invalid
 */
export async function updatePortfolioModeService(
  userId: string,
  mode: "tech" | "classic"
) {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(PORTFOLIO_MESSAGES.INVALID_MODE);
  }

  const sections = mode === 'tech'
    ? [...TECH_DEFAULT_SECTIONS]
    : [...CLASSIC_DEFAULT_SECTIONS];
  const sectionVisibility = Object.fromEntries(sections.map(s => [s, true]));

  return await updatePortfolioModeData(userId, mode, sections, sectionVisibility);
}

/**
 * Update a user's profile information
 *
 * Validates and delegates to the data layer.
 *
 * @param userId - The user's ID
 * @param data - Profile data to update (name, bio, image)
 * @returns Updated user record
 */
export async function updateProfileService(
  userId: string,
  data: {
    name: string;
    bio?: string | null;
    image?: string | null;
    sectionOrder?: string[];
    contactLinks?: Record<string, any>;
    sectionVisibility?: Record<string, any>;
  }
) {
  const result = await updateUserProfileData(userId, data);
  invalidateNarrativeCache(userId).catch(() => {});
  return result;
}
