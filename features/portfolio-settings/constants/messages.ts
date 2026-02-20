/**
 * PortfolioSettings Messages Constants
 *
 * User-facing messages for the portfolio settings feature.
 * Centralized for future i18n support.
 */

export const PORTFOLIO_SETTINGS_MESSAGES = {
  // Success messages
  UPDATE_SUCCESS: 'Portfolio settings updated successfully',

  // Validation error messages
  INVALID_THEME: 'Invalid theme ID. Please select a valid theme preset.',
  INVALID_LAYOUT: 'Invalid layout variant. Must be one of: bento, stacked, sidebar.',
  INVALID_HERO_STYLE: 'Invalid hero style. Must be one of: standard, minimal, cover.',
} as const;

export type PortfolioSettingsMessageKey = keyof typeof PORTFOLIO_SETTINGS_MESSAGES;
