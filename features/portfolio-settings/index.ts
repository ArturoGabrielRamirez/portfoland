/**
 * PortfolioSettings Feature Barrel
 *
 * Re-exports all public API from the portfolio-settings feature.
 */

// Types
export type {
  PortfolioSettingsModel,
  ThemePreset,
  UpdatePortfolioSettingsInput,
  PortfolioSettingsData,
} from './types/portfolioSettings';

// Constants
export { THEME_PRESETS } from './constants/themes';
export { PORTFOLIO_SETTINGS_MESSAGES } from './constants/messages';

// Schema types
export type { UpdatePortfolioSettingsSchemaInput } from './schemas/portfolioSettings.schema';

// Data functions
export {
  getPortfolioSettingsData,
  updatePortfolioSettingsData,
} from './data';

// Service functions
export {
  getPortfolioSettingsService,
  updatePortfolioSettingsService,
} from './services/portfolioSettings.service';

// Actions
export { updatePortfolioSettingsAction } from './actions/portfolioSettingsActions';
