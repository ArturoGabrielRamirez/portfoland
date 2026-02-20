/**
 * Portfolio Theme Presets
 *
 * Defines the available Classic Mode visual themes.
 * Each preset specifies a complete set of design tokens for a portfolio theme.
 */

import type { ThemePreset } from '../types/portfolioSettings';

// =============================================================================
// Theme Preset Definitions
// =============================================================================

/**
 * All available Classic Mode theme presets
 *
 * Key is the theme ID stored in PortfolioSettings.theme.
 * The "default" preset is applied when no theme has been explicitly set.
 */
export const THEME_PRESETS: Record<string, ThemePreset> = {
  default: {
    id: 'default',
    name: 'Clean White',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#2563eb',
    borderColor: '#e5e7eb',
    cardBackground: '#f9fafb',
    fontFamily: 'Inter',
  },
  warm: {
    id: 'warm',
    name: 'Warm Cream',
    backgroundColor: '#fdf8f0',
    textColor: '#292524',
    accentColor: '#d97706',
    borderColor: '#e7d9c8',
    cardBackground: '#fef3c7',
    fontFamily: 'Georgia',
  },
  'dark-elegant': {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    backgroundColor: '#030712',
    textColor: '#f9fafb',
    accentColor: '#ca8a04',
    borderColor: '#1f2937',
    cardBackground: '#111827',
    fontFamily: 'Inter',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    accentColor: '#0d9488',
    borderColor: '#e2e8f0',
    cardBackground: '#f1f5f9',
    fontFamily: 'Inter',
  },
} as const;
