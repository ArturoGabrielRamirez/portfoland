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
export { PanelNavigation } from './components/PanelNavigation';
export { PortfolioLayout } from './components/PortfolioLayout';

// =============================================================================
// Constants
// =============================================================================

export { PORTFOLIO_MESSAGES, PORTFOLIO_MODES } from './constants/messages';
export {
  PORTFOLIO_SECTIONS,
  DEFAULT_SECTION,
  type PortfolioSectionKey,
} from './constants/sections';

// =============================================================================
// Schemas
// =============================================================================

export {
  updatePortfolioModeSchema,
  type UpdatePortfolioModeInput,
} from './schemas/portfolio.schema';
