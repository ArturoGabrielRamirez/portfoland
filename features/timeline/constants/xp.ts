/**
 * XP and Experience Type Constants
 *
 * Constants for XP values, colors, and labels for each experience type.
 */

import type { ExperienceType } from '@/app/generated/prisma/enums';

// =============================================================================
// XP Values
// =============================================================================

/**
 * XP awarded for each experience type
 */
export const XP_VALUES: Record<ExperienceType, number> = {
  WORK: 500,
  CERTIFICATION: 400,
  PROJECT: 350,
  EDUCATION: 200,
} as const;

/**
 * Calculate XP for a given experience type
 */
export function calculateXP(type: ExperienceType): number {
  return XP_VALUES[type];
}

// =============================================================================
// Experience Type Colors
// =============================================================================

/**
 * Primary colors for each experience type (hex)
 */
export const EXPERIENCE_COLORS: Record<ExperienceType, string> = {
  WORK: '#00D4FF', // Cyan
  EDUCATION: '#A855F7', // Purple
  PROJECT: '#22C55E', // Green
  CERTIFICATION: '#EAB308', // Yellow
} as const;

/**
 * Glow colors for hexagon nodes (with opacity for glow effect)
 */
export const EXPERIENCE_GLOW_COLORS: Record<ExperienceType, string> = {
  WORK: 'rgba(0, 212, 255, 0.6)', // Cyan glow
  EDUCATION: 'rgba(168, 85, 247, 0.6)', // Purple glow
  PROJECT: 'rgba(34, 197, 94, 0.6)', // Green glow
  CERTIFICATION: 'rgba(234, 179, 8, 0.6)', // Yellow glow
} as const;

/**
 * Tailwind CSS class names for each experience type
 */
export const EXPERIENCE_COLOR_CLASSES: Record<ExperienceType, {
  bg: string;
  text: string;
  border: string;
  glow: string;
}> = {
  WORK: {
    bg: 'bg-cyan-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.6)]',
  },
  EDUCATION: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
  },
  PROJECT: {
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-500',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]',
  },
  CERTIFICATION: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
  },
} as const;

// =============================================================================
// Experience Type Labels
// =============================================================================

/**
 * Display labels for each experience type (Spanish)
 */
export const EXPERIENCE_LABELS_ES: Record<ExperienceType, string> = {
  WORK: 'Trabajo',
  EDUCATION: 'Educación',
  PROJECT: 'Proyecto',
  CERTIFICATION: 'Certificación',
} as const;

/**
 * Display labels for each experience type (English)
 */
export const EXPERIENCE_LABELS_EN: Record<ExperienceType, string> = {
  WORK: 'Work',
  EDUCATION: 'Education',
  PROJECT: 'Project',
  CERTIFICATION: 'Certification',
} as const;

/**
 * Get experience label by locale
 */
export function getExperienceLabel(type: ExperienceType, locale: 'en' | 'es' = 'en'): string {
  return locale === 'es' ? EXPERIENCE_LABELS_ES[type] : EXPERIENCE_LABELS_EN[type];
}

// =============================================================================
// Experience Type Icons (for use with lucide-react)
// =============================================================================

/**
 * Icon names for each experience type (lucide-react icon names)
 */
export const EXPERIENCE_ICONS: Record<ExperienceType, string> = {
  WORK: 'Briefcase',
  EDUCATION: 'GraduationCap',
  PROJECT: 'Rocket',
  CERTIFICATION: 'Award',
} as const;

// =============================================================================
// Filter Options
// =============================================================================

/**
 * All experience types for filter dropdown/tabs
 */
export const EXPERIENCE_TYPES: ExperienceType[] = [
  'WORK',
  'EDUCATION',
  'PROJECT',
  'CERTIFICATION',
] as const;

/**
 * Filter options including "ALL"
 */
export const FILTER_OPTIONS = ['ALL', ...EXPERIENCE_TYPES] as const;
export type FilterOption = (typeof FILTER_OPTIONS)[number];

// =============================================================================
// Theme Colors (Gaming Aesthetic)
// =============================================================================

/**
 * Background colors for the gaming theme
 */
export const THEME_COLORS = {
  background: '#0A0E1A',
  cardBackground: '#0D1421',
  cardBorder: '#1E293B',
  accent: '#00D4FF',
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
} as const;

// =============================================================================
// Coordinate Validation
// =============================================================================

/**
 * Valid coordinate ranges
 */
export const COORDINATE_LIMITS = {
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
} as const;

/**
 * Validate coordinates are within valid range
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= COORDINATE_LIMITS.latitude.min &&
    latitude <= COORDINATE_LIMITS.latitude.max &&
    longitude >= COORDINATE_LIMITS.longitude.min &&
    longitude <= COORDINATE_LIMITS.longitude.max
  );
}

/**
 * Default coordinates (Buenos Aires, Argentina)
 */
export const DEFAULT_COORDINATES = {
  latitude: -34.6037,
  longitude: -58.3816,
  address: 'Buenos Aires, Argentina',
} as const;
