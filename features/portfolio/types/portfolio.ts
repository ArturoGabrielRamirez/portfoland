/**
 * Portfolio Types
 *
 * Type definitions for the portfolio feature.
 * Uses Prisma types as foundation and extends with Pick/Omit utilities.
 */

import type { PublicTimelineData } from '@/features/timeline/types/experience';
import type { PublicSkillsData } from '@/features/skills/types/public-skills';
import type { Project } from '@/features/projects/types/project';
import type { ServiceModel } from '@/features/services/types/service';
import type { TestimonialModel } from '@/features/testimonials/types/testimonial';
import type { GalleryItemModel } from '@/features/gallery/types/galleryItem';
import type { PortfolioSettingsData } from '@/features/portfolio-settings/types/portfolioSettings';

// =============================================================================
// Core Types
// =============================================================================

/**
 * Portfolio visual mode
 */
export type PortfolioMode = 'classic' | 'tech';

/**
 * Portfolio view/layout mode
 */
export type PortfolioViewMode = 'sections' | 'one_page' | 'minimal' | 'terminal';

/**
 * User data for portfolio display
 */
export interface PortfolioUser {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  bio: string | null;
  portfolioMode: PortfolioMode;
  locale: string;
  sectionOrder: string[];
  contactLinks: Record<string, any>;
  sectionVisibility: Record<string, boolean>;
}

/**
 * Project data derived from the Project model
 */
export type ProjectData = Project;

/**
 * Aggregated portfolio data for a public portfolio page.
 * Includes all sections for both Tech Mode and Classic Mode.
 */
export interface PortfolioData {
  user: PortfolioUser;
  experiences: PublicTimelineData | null;
  skills: PublicSkillsData | null;
  projects: ProjectData[];
  // Classic Mode fields
  services: ServiceModel[];
  testimonials: TestimonialModel[];
  gallery: GalleryItemModel[];
  settings: PortfolioSettingsData | null;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for the main portfolio layout component
 */
export interface PortfolioLayoutProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

/**
 * Props for individual portfolio section panels
 */
export interface PortfolioSectionProps {
  data: PortfolioData;
  className?: string;
}

/**
 * Props for the panel navigation component
 */
export interface PanelNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mode: PortfolioMode;
  className?: string;
  sectionOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
}

/**
 * Props for the portfolio mode toggle in the dashboard header
 */
export interface PortfolioModeToggleProps {
  currentMode: string;
}
