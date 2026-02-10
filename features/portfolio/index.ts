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

// Professional Mode Components
export { ProfessionalHero } from './components/professional/ProfessionalHero';
export { ProfessionalAbout } from './components/professional/ProfessionalAbout';
export { ProfessionalTimeline } from './components/professional/ProfessionalTimeline';
export { ProfessionalSkills } from './components/professional/ProfessionalSkills';
export { ProfessionalProjects } from './components/professional/ProfessionalProjects';
export { ProfessionalContact } from './components/professional/ProfessionalContact';
export { ProfessionalAI } from './components/professional/ProfessionalAI';

// Gaming Mode Components
export { GamingHero } from './components/gaming/GamingHero';
export { GamingAbout } from './components/gaming/GamingAbout';
export { GamingTimeline } from './components/gaming/GamingTimeline';
export { GamingSkills } from './components/gaming/GamingSkills';
export { GamingProjects } from './components/gaming/GamingProjects';
export { GamingContact } from './components/gaming/GamingContact';
export { GamingAI } from './components/gaming/GamingAI';

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
