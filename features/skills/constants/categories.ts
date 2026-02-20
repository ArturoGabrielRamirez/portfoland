/**
 * Skill Category Constants
 *
 * Predefined categories, colors, and icons for skill organization.
 */

// =============================================================================
// Category Types
// =============================================================================

export type CategorySlug =
  | 'core'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'design'
  | 'soft-skills';

// =============================================================================
// Default Categories
// =============================================================================

/**
 * Predefined skill categories
 * Core category is positioned at galaxy center; others as orbital clusters
 */
export const DEFAULT_CATEGORIES = [
  {
    slug: 'core',
    name: 'Core / Fundamentals',
    nameEs: 'Fundamentos',
    description: 'Foundation skills: HTML, CSS, JavaScript, TypeScript',
    descriptionEs: 'Habilidades fundamentales: HTML, CSS, JavaScript, TypeScript',
    isCore: true,
  },
  {
    slug: 'frontend',
    name: 'Frontend',
    nameEs: 'Frontend',
    description: 'UI frameworks and libraries: React, Angular, Vue',
    descriptionEs: 'Frameworks y bibliotecas de UI: React, Angular, Vue',
    isCore: false,
  },
  {
    slug: 'backend',
    name: 'Backend',
    nameEs: 'Backend',
    description: 'Server-side: Node.js, Python, databases, APIs',
    descriptionEs: 'Lado del servidor: Node.js, Python, bases de datos, APIs',
    isCore: false,
  },
  {
    slug: 'devops',
    name: 'DevOps',
    nameEs: 'DevOps',
    description: 'Infrastructure: Docker, CI/CD, cloud platforms',
    descriptionEs: 'Infraestructura: Docker, CI/CD, plataformas en la nube',
    isCore: false,
  },
  {
    slug: 'design',
    name: 'Design',
    nameEs: 'Diseno',
    description: 'UI/UX design: Figma, design principles',
    descriptionEs: 'Diseno UI/UX: Figma, principios de diseno',
    isCore: false,
  },
  {
    slug: 'soft-skills',
    name: 'Soft Skills',
    nameEs: 'Habilidades Blandas',
    description: 'Communication, Leadership, Problem-solving',
    descriptionEs: 'Comunicacion, Liderazgo, Resolucion de problemas',
    isCore: false,
  },
] as const;

// =============================================================================
// Category Colors
// =============================================================================

/**
 * Primary colors for each category (hex)
 * Used for galaxy cluster visualization and UI theming
 */
export const CATEGORY_COLORS: Record<CategorySlug, string> = {
  core: '#D946EF', // Magenta/Violet - fundamentals
  frontend: '#A855F7', // Purple
  backend: '#22C55E', // Green
  devops: '#F97316', // Orange
  design: '#EC4899', // Pink
  'soft-skills': '#EAB308', // Yellow
} as const;

/**
 * Glow colors for category visualization (with opacity)
 */
export const CATEGORY_GLOW_COLORS: Record<CategorySlug, string> = {
  core: 'rgba(217, 70, 239, 0.6)',
  frontend: 'rgba(168, 85, 247, 0.6)',
  backend: 'rgba(34, 197, 94, 0.6)',
  devops: 'rgba(249, 115, 22, 0.6)',
  design: 'rgba(236, 72, 153, 0.6)',
  'soft-skills': 'rgba(234, 179, 8, 0.6)',
} as const;

/**
 * Tailwind CSS class names for each category
 */
export const CATEGORY_COLOR_CLASSES: Record<CategorySlug, {
  bg: string;
  text: string;
  border: string;
  glow: string;
}> = {
  core: {
    bg: 'bg-[#D946EF]',
    text: 'text-[#D946EF]',
    border: 'border-[#D946EF]',
    glow: 'shadow-[0_0_20px_rgba(217,70,239,0.6)]',
  },
  frontend: {
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
  },
  backend: {
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-500',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]',
  },
  devops: {
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]',
  },
  design: {
    bg: 'bg-pink-500',
    text: 'text-pink-400',
    border: 'border-pink-500',
    glow: 'shadow-[0_0_20px_rgba(236,72,153,0.6)]',
  },
  'soft-skills': {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
  },
} as const;

// =============================================================================
// Category Icons
// =============================================================================

/**
 * Icon names for each category (lucide-react icon names)
 */
export const CATEGORY_ICONS: Record<CategorySlug, string> = {
  core: 'Code',
  frontend: 'Monitor',
  backend: 'Server',
  devops: 'Cloud',
  design: 'Palette',
  'soft-skills': 'Users',
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: CategorySlug) {
  return DEFAULT_CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Get category color by slug
 */
export function getCategoryColor(slug: CategorySlug): string {
  return CATEGORY_COLORS[slug] ?? CATEGORY_COLORS.core;
}

/**
 * Get category name by locale
 */
export function getCategoryName(slug: CategorySlug, locale: 'en' | 'es' = 'en'): string {
  const category = getCategoryBySlug(slug);
  if (!category) return slug;
  return locale === 'es' ? category.nameEs : category.name;
}

/**
 * Get all category slugs
 */
export function getAllCategorySlugs(): CategorySlug[] {
  return DEFAULT_CATEGORIES.map((cat) => cat.slug as CategorySlug);
}
