/**
 * PortfolioSettings Service Layer
 *
 * Business logic for portfolio settings operations.
 * Validates business rules and orchestrates data layer calls.
 */

import type { PortfolioSettingsModel, UpdatePortfolioSettingsInput } from '../types/portfolioSettings';
import { getPortfolioSettingsData, updatePortfolioSettingsData } from '../data';
import { PORTFOLIO_SETTINGS_MESSAGES } from '../constants/messages';
import { THEME_PRESETS } from '../constants/themes';

// =============================================================================
// Allowed Values
// =============================================================================

const VALID_LAYOUT_VARIANTS = ['bento', 'stacked', 'sidebar'] as const;
const VALID_HERO_STYLES = ['standard', 'minimal', 'cover'] as const;

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Get portfolio settings for a user
 *
 * Delegates to the data layer which uses upsert for lazy creation.
 * First access automatically creates default settings.
 *
 * @param userId - The user ID whose settings to retrieve
 * @returns The user's portfolio settings
 */
export async function getPortfolioSettingsService(
  userId: string
): Promise<PortfolioSettingsModel> {
  return getPortfolioSettingsData(userId);
}

/**
 * Update portfolio settings for a user
 *
 * Validates theme, layoutVariant, and heroStyle values before persisting.
 *
 * @param userId - The user ID whose settings to update
 * @param input - The fields to update
 * @returns The updated portfolio settings
 * @throws Error if theme ID is not in THEME_PRESETS
 * @throws Error if layoutVariant is not in allowed list
 * @throws Error if heroStyle is not in allowed list
 */
export async function updatePortfolioSettingsService(
  userId: string,
  input: UpdatePortfolioSettingsInput
): Promise<PortfolioSettingsModel> {
  // Validate theme ID exists in THEME_PRESETS
  if (input.theme !== undefined) {
    if (!Object.keys(THEME_PRESETS).includes(input.theme)) {
      throw new Error(PORTFOLIO_SETTINGS_MESSAGES.INVALID_THEME);
    }
  }

  // Validate layoutVariant is in allowed list
  if (input.layoutVariant !== undefined) {
    if (!(VALID_LAYOUT_VARIANTS as readonly string[]).includes(input.layoutVariant)) {
      throw new Error(PORTFOLIO_SETTINGS_MESSAGES.INVALID_LAYOUT);
    }
  }

  // Validate heroStyle is in allowed list
  if (input.heroStyle !== undefined) {
    if (!(VALID_HERO_STYLES as readonly string[]).includes(input.heroStyle)) {
      throw new Error(PORTFOLIO_SETTINGS_MESSAGES.INVALID_HERO_STYLE);
    }
  }

  return updatePortfolioSettingsData(userId, input);
}
