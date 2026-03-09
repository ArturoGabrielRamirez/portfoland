/**
 * OnePageTemplate
 *
 * Renders all visible sections sequentially in a single scrollable page.
 * No PanelNavigation, no tab switching. Respects section order and visibility.
 */

'use client';

import { PORTFOLIO_SECTIONS } from '../../constants/sections';
import type { PortfolioSectionProps, PortfolioMode } from '../../types/portfolio';
import type { PortfolioSectionKey } from '../../constants/sections';
import type { PortfolioData } from '../../types/portfolio';
import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';

// Classic mode components
import { ClassicHero } from '../classic/ClassicHero';
import { ClassicAbout } from '../classic/ClassicAbout';
import { ClassicTimeline } from '../classic/ClassicTimeline';
import { ClassicSkills } from '../classic/ClassicSkills';
import { ClassicProjects } from '../classic/ClassicProjects';
import { ClassicContact } from '../classic/ClassicContact';
import { ClassicAI } from '../classic/ClassicAI';
import { ClassicGallery } from '../classic/ClassicGallery';
import { ClassicServices } from '../classic/ClassicServices';
import { ClassicTestimonials } from '../classic/ClassicTestimonials';

// Tech mode components
import { TechHero } from '../tech/TechHero';
import { TechAbout } from '../tech/TechAbout';
import { TechTimeline } from '../tech/TechTimeline';
import { TechSkills } from '../tech/TechSkills';
import { TechProjects } from '../tech/TechProjects';
import { TechContact } from '../tech/TechContact';
import { TechAI } from '../tech/TechAI';

// =============================================================================
// Section Component Maps
// =============================================================================

const classicSections: Partial<Record<PortfolioSectionKey, React.ComponentType<PortfolioSectionProps>>> = {
  hero: ClassicHero,
  about: ClassicAbout,
  timeline: ClassicTimeline,
  skills: ClassicSkills,
  projects: ClassicProjects,
  contact: ClassicContact,
  ai: ClassicAI,
  gallery: ClassicGallery,
  services: ClassicServices,
  testimonials: ClassicTestimonials,
};

const techSections: Partial<Record<PortfolioSectionKey, React.ComponentType<PortfolioSectionProps>>> = {
  hero: TechHero,
  about: TechAbout,
  timeline: TechTimeline,
  skills: TechSkills,
  projects: TechProjects,
  contact: TechContact,
  ai: TechAI,
};

// =============================================================================
// Component
// =============================================================================

interface OnePageTemplateProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

export function OnePageTemplate({ data, mode }: OnePageTemplateProps) {
  const isClassic = mode === 'classic';
  const sections = isClassic ? classicSections : techSections;
  
  // Resolve Theme
  const isCustomTheme = data.settings?.theme === 'custom' && data.settings?.customTheme;
  const preset = isCustomTheme 
    ? (data.settings!.customTheme as any) // Shape matches ThemePreset's color fields
    : (THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default']);

  const orderMap: Record<string, string> = { 'experience': 'timeline' };
  const userOrder = data.user.sectionOrder || [];
  const visibility = (data.user.sectionVisibility || {}) as Record<string, boolean>;

  const isVisible = (key: string) => {
    if (key === 'hero') return true;
    const v = visibility[key];
    if (key === 'timeline') return v !== false && visibility['experience'] !== false;
    if (key === 'experience') return v !== false && visibility['timeline'] !== false;
    return v !== false;
  };

  let fullOrder = ['hero', ...userOrder, 'contact', 'ai'];
  fullOrder = Array.from(new Set(fullOrder));
  if (userOrder.length === 0) {
    fullOrder = PORTFOLIO_SECTIONS.map(s => s.key);
  }

  return (
    <div
      className={isClassic ? 'bg-[var(--portfolio-bg)] text-[var(--portfolio-text)] min-h-screen pb-8' : 'bg-[#0A0E1A] text-white min-h-screen pb-8 relative overflow-x-hidden'}
      style={isClassic ? {
        '--portfolio-bg': preset.backgroundColor,
        '--portfolio-text': preset.textColor,
        '--portfolio-accent': preset.accentColor,
        '--portfolio-border': preset.borderColor,
        '--portfolio-card-bg': preset.cardBackground,
        fontFamily: preset.fontFamily,
      } as React.CSSProperties : undefined}
    >
      {/* CRT Overlay (Tech Mode only) */}
      {!isClassic && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          <div className="crt-lines absolute inset-0 opacity-[0.03]" />
          <div className="crt-scanner" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/[0.02] to-transparent animate-scanline-flash opacity-20" />
        </div>
      )}

      {fullOrder
        .filter(key => isVisible(key))
        .map((userKey) => {
          const internalKey = (orderMap[userKey] || userKey) as PortfolioSectionKey;
          const SectionComponent = sections[internalKey];
          if (!SectionComponent) return null;

          return (
            <section key={internalKey} id={`section-${internalKey}`} className="scroll-mt-20 p-4 md:p-6">
              <SectionComponent data={data} />
            </section>
          );
        })}
    </div>
  );
}
