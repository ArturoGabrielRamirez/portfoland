/**
 * Portfolio Section Constants
 *
 * Defines the 7 portfolio sections with their keys, icons, and i18n label keys.
 */

export const PORTFOLIO_SECTIONS = [
  { key: 'hero', icon: 'User', labelKey: 'nav.hero' },
  { key: 'about', icon: 'FileText', labelKey: 'nav.about' },
  { key: 'timeline', icon: 'Clock', labelKey: 'nav.timeline' },
  { key: 'skills', icon: 'Zap', labelKey: 'nav.skills' },
  { key: 'projects', icon: 'FolderOpen', labelKey: 'nav.projects' },
  { key: 'contact', icon: 'Mail', labelKey: 'nav.contact' },
  { key: 'ai', icon: 'Bot', labelKey: 'nav.ai' },
] as const;

export type PortfolioSectionKey = (typeof PORTFOLIO_SECTIONS)[number]['key'];

export const DEFAULT_SECTION: PortfolioSectionKey = 'hero';
