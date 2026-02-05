/**
 * Portfolio Service Layer
 *
 * Business logic for portfolio operations.
 * Validates business rules and orchestrates data layer calls.
 */

import { PORTFOLIO_MODES, PORTFOLIO_MESSAGES } from '../constants/messages';
import { updatePortfolioModeData } from '../data/updatePortfolioMode.data';

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
  mode: string
) {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(PORTFOLIO_MESSAGES.INVALID_MODE);
  }

  return await updatePortfolioModeData(userId, mode);
}
