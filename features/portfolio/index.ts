/**
 * Portfolio Feature
 *
 * Public portfolio page with Professional and Gaming visual modes.
 */

// =============================================================================
// Types
// =============================================================================

export type {
  PortfolioMode,
  PortfolioData,
  PortfolioUser,
  ProjectData,
  PortfolioLayoutProps,
  PortfolioSectionProps,
  PanelNavigationProps,
  PortfolioModeToggleProps,
} from './types/portfolio';

// =============================================================================
// Data Layer
// =============================================================================

export {
  getPortfolioByUsername,
  getPublicProjectsByUsername,
  updatePortfolioModeData,
} from './data';

// =============================================================================
// Services
// =============================================================================

export { updatePortfolioModeService } from './services/portfolio.service';

// =============================================================================
// Actions
// =============================================================================

export { togglePortfolioMode } from './actions/togglePortfolioMode';

// =============================================================================
// Components
// =============================================================================

export { PortfolioModeToggle } from './components/PortfolioModeToggle';

// =============================================================================
// Constants
// =============================================================================

export { PORTFOLIO_MESSAGES, PORTFOLIO_MODES } from './constants/messages';

// =============================================================================
// Schemas
// =============================================================================

export {
  updatePortfolioModeSchema,
  type UpdatePortfolioModeInput,
} from './schemas/portfolio.schema';
