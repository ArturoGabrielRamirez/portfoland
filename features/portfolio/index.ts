/**
 * Portfolio Feature
 *
 * Public portfolio page with Classic and Tech visual modes.
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
// Actions (safe for client imports)
// =============================================================================

export { togglePortfolioMode } from './actions/togglePortfolioMode';

// =============================================================================
// Components
// =============================================================================

export { PortfolioModeToggle } from './components/PortfolioModeToggle';
export { PanelNavigation } from './components/PanelNavigation';
export { PortfolioLayout } from './components/PortfolioLayout';

// Classic Mode Components
export { ClassicHero } from './components/classic/ClassicHero';
export { ClassicAbout } from './components/classic/ClassicAbout';
export { ClassicTimeline } from './components/classic/ClassicTimeline';
export { ClassicSkills } from './components/classic/ClassicSkills';
export { ClassicProjects } from './components/classic/ClassicProjects';
export { ClassicContact } from './components/classic/ClassicContact';
export { ClassicAI } from './components/classic/ClassicAI';

// Tech Mode Components
export { TechHero } from './components/tech/TechHero';
export { TechAbout } from './components/tech/TechAbout';
export { TechTimeline } from './components/tech/TechTimeline';
export { TechSkills } from './components/tech/TechSkills';
export { TechProjects } from './components/tech/TechProjects';
export { TechContact } from './components/tech/TechContact';
export { TechAI } from './components/tech/TechAI';

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
