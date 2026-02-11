/**
 * Portfolio Messages Constants
 *
 * User-facing messages for the portfolio feature.
 */

export const PORTFOLIO_MESSAGES = {
  MODE_UPDATE_SUCCESS: 'Portfolio mode updated successfully',
  MODE_UPDATE_ERROR: 'Failed to update portfolio mode',
  INVALID_MODE: 'Invalid portfolio mode',
  LOGIN_REQUIRED: 'Please log in to continue',
  USER_NOT_FOUND: 'User not found',
} as const;

export const PORTFOLIO_MODES = {
  PROFESSIONAL: 'professional',
  GAMING: 'gaming',
} as const;

export type PortfolioMessageKey = keyof typeof PORTFOLIO_MESSAGES;
