/**
 * Skill Level Visual Constants
 *
 * Visual styling definitions for skill levels L1-L5,
 * including opacity, glow effects, and Tailwind classes.
 */

// =============================================================================
// Level Visual Styles
// =============================================================================

/**
 * Visual style configuration for each skill level
 * - L1 (Novice): Dim node, no glow
 * - L2 (Apprentice): Soft glow, 50% opacity
 * - L3 (Journeyman): Full glow, 80% opacity
 * - L4 (Expert): Full opacity, glow + particle effect
 * - L5 (Master): Legendary golden glow + crown icon
 */
export const LEVEL_VISUAL_STYLES = {
  1: {
    name: 'Novice',
    opacity: 0.3,
    glowIntensity: 0,
    hasGlow: false,
    hasParticles: false,
    hasCrown: false,
    fillOpacity: 0.3,
    strokeOpacity: 0.5,
    animationScale: 1.0,
  },
  2: {
    name: 'Apprentice',
    opacity: 0.5,
    glowIntensity: 0.3,
    hasGlow: true,
    hasParticles: false,
    hasCrown: false,
    fillOpacity: 0.5,
    strokeOpacity: 0.7,
    animationScale: 1.02,
  },
  3: {
    name: 'Journeyman',
    opacity: 0.8,
    glowIntensity: 0.6,
    hasGlow: true,
    hasParticles: false,
    hasCrown: false,
    fillOpacity: 0.8,
    strokeOpacity: 0.9,
    animationScale: 1.04,
  },
  4: {
    name: 'Expert',
    opacity: 1.0,
    glowIntensity: 0.8,
    hasGlow: true,
    hasParticles: true,
    hasCrown: false,
    fillOpacity: 1.0,
    strokeOpacity: 1.0,
    animationScale: 1.06,
  },
  5: {
    name: 'Master',
    opacity: 1.0,
    glowIntensity: 1.0,
    hasGlow: true,
    hasParticles: true,
    hasCrown: true,
    fillOpacity: 1.0,
    strokeOpacity: 1.0,
    animationScale: 1.08,
    goldenOverlay: true,
  },
} as const;

// =============================================================================
// Tailwind Classes by Level
// =============================================================================

/**
 * Tailwind CSS classes for each skill level
 * These classes can be applied to hexagon nodes for level-based styling
 */
export const LEVEL_TAILWIND_CLASSES = {
  1: {
    container: 'opacity-30',
    fill: 'fill-current opacity-30',
    stroke: 'stroke-current opacity-50',
    glow: '',
    animation: '',
    badge: 'bg-slate-600 text-slate-300',
  },
  2: {
    container: 'opacity-50',
    fill: 'fill-current opacity-50',
    stroke: 'stroke-current opacity-70',
    glow: 'shadow-[0_0_10px_currentColor]',
    animation: 'hover:scale-102',
    badge: 'bg-slate-500 text-slate-200',
  },
  3: {
    container: 'opacity-80',
    fill: 'fill-current opacity-80',
    stroke: 'stroke-current opacity-90',
    glow: 'shadow-[0_0_20px_currentColor]',
    animation: 'hover:scale-104 transition-transform',
    badge: 'bg-blue-500 text-white',
  },
  4: {
    container: 'opacity-100',
    fill: 'fill-current opacity-100',
    stroke: 'stroke-current opacity-100',
    glow: 'shadow-[0_0_30px_currentColor] animate-pulse-slow',
    animation: 'hover:scale-106 transition-transform',
    badge: 'bg-purple-500 text-white',
  },
  5: {
    container: 'opacity-100',
    fill: 'fill-current opacity-100',
    stroke: 'stroke-current opacity-100',
    glow: 'shadow-[0_0_40px_rgba(234,179,8,0.8)] ring-2 ring-yellow-400',
    animation: 'hover:scale-108 transition-transform animate-glow-golden',
    badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold',
  },
} as const;

// =============================================================================
// Level Badge Colors
// =============================================================================

/**
 * Badge color configuration for level indicators
 */
export const LEVEL_BADGE_COLORS = {
  1: {
    bg: '#475569', // slate-600
    text: '#CBD5E1', // slate-300
    border: '#64748B', // slate-500
  },
  2: {
    bg: '#64748B', // slate-500
    text: '#E2E8F0', // slate-200
    border: '#94A3B8', // slate-400
  },
  3: {
    bg: '#3B82F6', // blue-500
    text: '#FFFFFF',
    border: '#60A5FA', // blue-400
  },
  4: {
    bg: '#A855F7', // purple-500
    text: '#FFFFFF',
    border: '#C084FC', // purple-400
  },
  5: {
    bg: '#F59E0B', // amber-500
    text: '#000000',
    border: '#FBBF24', // amber-400
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
  },
} as const;

// =============================================================================
// Glow Filters (for SVG)
// =============================================================================

/**
 * SVG filter definitions for level-based glow effects
 */
export const LEVEL_GLOW_FILTERS = {
  1: {
    stdDeviation: 0,
    floodOpacity: 0,
  },
  2: {
    stdDeviation: 2,
    floodOpacity: 0.3,
  },
  3: {
    stdDeviation: 4,
    floodOpacity: 0.6,
  },
  4: {
    stdDeviation: 6,
    floodOpacity: 0.8,
  },
  5: {
    stdDeviation: 8,
    floodOpacity: 1.0,
    goldenColor: '#F59E0B',
  },
} as const;

// =============================================================================
// Animation Keyframes
// =============================================================================

/**
 * Animation configuration for level effects
 */
export const LEVEL_ANIMATIONS = {
  particleCount: {
    1: 0,
    2: 0,
    3: 0,
    4: 4,
    5: 8,
  },
  pulseSpeed: {
    1: 0,
    2: 0,
    3: 0,
    4: 2000, // ms
    5: 1500, // ms - faster for master
  },
  glowPulseRange: {
    1: [0, 0],
    2: [0.2, 0.4],
    3: [0.4, 0.8],
    4: [0.6, 1.0],
    5: [0.8, 1.2],
  },
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get visual style for a skill level
 */
export function getLevelVisualStyle(level: 1 | 2 | 3 | 4 | 5) {
  return LEVEL_VISUAL_STYLES[level];
}

/**
 * Get Tailwind classes for a skill level
 */
export function getLevelTailwindClasses(level: 1 | 2 | 3 | 4 | 5) {
  return LEVEL_TAILWIND_CLASSES[level];
}

/**
 * Get badge colors for a skill level
 */
export function getLevelBadgeColors(level: 1 | 2 | 3 | 4 | 5) {
  return LEVEL_BADGE_COLORS[level];
}

/**
 * Check if level should show particles
 */
export function shouldShowParticles(level: 1 | 2 | 3 | 4 | 5): boolean {
  return LEVEL_VISUAL_STYLES[level].hasParticles;
}

/**
 * Check if level should show crown badge
 */
export function shouldShowCrown(level: 1 | 2 | 3 | 4 | 5): boolean {
  return LEVEL_VISUAL_STYLES[level].hasCrown;
}
