/**
 * PortfolioSettings Types
 *
 * Re-exports Prisma types and defines derived types for the PortfolioSettings feature.
 */

// =============================================================================
// Re-export Prisma Types
// =============================================================================

export type { PortfolioSettingsModel } from '@/app/generated/prisma/models/PortfolioSettings';

import type { PortfolioSettingsModel } from '@/app/generated/prisma/models/PortfolioSettings';

// =============================================================================
// Theme Preset Type
// =============================================================================

/**
 * Represents a complete visual theme preset for Classic Mode portfolios
 */
export interface ThemePreset {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  cardBackground: string;
  fontFamily: string;
}

// =============================================================================
// Input Types
// =============================================================================

/**
 * Input for updating portfolio settings
 * All fields are optional — only provided fields will be updated
 */
export interface UpdatePortfolioSettingsInput {
  theme?: string;
  layoutVariant?: string;
  accentColor?: string | null;
  fontFamily?: string | null;
  heroStyle?: string;
  showBranding?: boolean;
}

// =============================================================================
// Public Data Types
// =============================================================================

/**
 * Theme-relevant fields of PortfolioSettings for public portfolio rendering
 * Used when embedding settings data in the PortfolioData aggregation type
 */
export type PortfolioSettingsData = Pick<
  PortfolioSettingsModel,
  | 'id'
  | 'userId'
  | 'theme'
  | 'layoutVariant'
  | 'accentColor'
  | 'fontFamily'
  | 'heroStyle'
  | 'showBranding'
>;
