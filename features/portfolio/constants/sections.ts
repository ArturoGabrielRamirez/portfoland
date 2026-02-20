/**
 * Portfolio Section Constants
 *
 * Defines all 10 portfolio sections with their keys, icons, and i18n label keys.
 * Also exports mode-specific default section arrays for Tech Mode and Classic Mode.
 */

export const PORTFOLIO_SECTIONS = [
  { key: 'hero', icon: 'User', labelKey: 'nav.hero' },
  { key: 'about', icon: 'FileText', labelKey: 'nav.about' },
  { key: 'timeline', icon: 'Clock', labelKey: 'nav.timeline' },
  { key: 'skills', icon: 'Zap', labelKey: 'nav.skills' },
  { key: 'projects', icon: 'FolderOpen', labelKey: 'nav.projects' },
  { key: 'contact', icon: 'Mail', labelKey: 'nav.contact' },
  { key: 'ai', icon: 'Bot', labelKey: 'nav.ai' },
  { key: 'services', icon: 'Briefcase', labelKey: 'nav.services' },
  { key: 'testimonials', icon: 'MessageSquare', labelKey: 'nav.testimonials' },
  { key: 'gallery', icon: 'Image', labelKey: 'nav.gallery' },
] as const;

export type PortfolioSectionKey = (typeof PORTFOLIO_SECTIONS)[number]['key'];

export const DEFAULT_SECTION: PortfolioSectionKey = 'hero';

/**
 * Default sections shown in Tech Mode.
 * Ordered for a developer/engineer portfolio.
 */
export const TECH_DEFAULT_SECTIONS = [
  'hero',
  'about',
  'timeline',
  'skills',
  'projects',
  'ai',
  'contact',
] as const;

/**
 * Default sections shown in Classic Mode.
 * Ordered for a service/presencial professional portfolio.
 */
export const CLASSIC_DEFAULT_SECTIONS = [
  'hero',
  'about',
  'gallery',
  'services',
  'skills',
  'testimonials',
  'contact',
] as const;
