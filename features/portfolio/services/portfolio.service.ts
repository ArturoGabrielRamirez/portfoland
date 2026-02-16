/**
 * Portfolio Service Layer
 *
 * Business logic for portfolio operations.
 * Validates business rules and orchestrates data layer calls.
 */

import { PORTFOLIO_MODES, PORTFOLIO_MESSAGES } from '../constants/messages';
import { updatePortfolioModeData } from '../data/updatePortfolioMode.data';
import { updateUserProfileData } from '../data/updateProfile.data';

const VALID_MODES = [PORTFOLIO_MODES.PROFESSIONAL, PORTFOLIO_MODES.GAMING];

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
  mode: "gaming" | "professional"
) {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(PORTFOLIO_MESSAGES.INVALID_MODE);
  }

  return await updatePortfolioModeData(userId, mode);
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
  }
) {
  return await updateUserProfileData(userId, data);
}
