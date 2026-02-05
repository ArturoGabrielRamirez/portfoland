/**
 * Portfolio Types
 *
 * Type definitions for the portfolio feature.
 * Uses Prisma types as foundation and extends with Pick/Omit utilities.
 */

import type { PublicTimelineData } from '@/features/timeline/types/experience';
import type { PublicSkillsData } from '@/features/skills/data/getPublicSkills.data';
import type { ExperienceModel } from '@/app/generated/prisma/models/Experience';

// =============================================================================
// Core Types
// =============================================================================

/**
 * Portfolio visual mode
 */
export type PortfolioMode = 'professional' | 'gaming';

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
}

/**
 * Project data derived from Experience model with type PROJECT
 */
export type ProjectData = ExperienceModel;

/**
 * Aggregated portfolio data for a public portfolio page
 */
export interface PortfolioData {
  user: PortfolioUser;
  experiences: PublicTimelineData | null;
  skills: PublicSkillsData | null;
  projects: ProjectData[];
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
}
