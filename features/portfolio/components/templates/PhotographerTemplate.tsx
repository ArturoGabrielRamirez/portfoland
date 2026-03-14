/**
 * PhotographerTemplate
 *
 * Classic Mode layout variant for photographers.
 * Section order: Hero → Gallery → Services → About → Contact
 * Skills and Timeline are omitted — not relevant for visual creatives.
 *
 * Reuses existing Classic section components with no CSS changes.
 */

import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import type { PortfolioData } from '../../types/portfolio';
import { ClassicHero } from '../classic/ClassicHero';
import { ClassicGallery } from '../classic/ClassicGallery';
import { ClassicServices } from '../classic/ClassicServices';
import { ClassicTestimonials } from '../classic/ClassicTestimonials';
import { ClassicAbout } from '../classic/ClassicAbout';
import { ClassicContact } from '../classic/ClassicContact';
import { ClassicAI } from '../classic/ClassicAI';

// =============================================================================
// Types
// =============================================================================

interface PhotographerTemplateProps {
  data: PortfolioData;
}

// =============================================================================
// Component
// =============================================================================

export function PhotographerTemplate({ data }: PhotographerTemplateProps) {
  // Resolve theme tokens — identical pattern to OnePageTemplate / SectionsTemplate
  const isCustomTheme = data.settings?.theme === 'custom' && data.settings?.customTheme;
  const preset = isCustomTheme
    ? (data.settings!.customTheme as any)
    : (THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default']);

  return (
    <div
      className="min-h-screen bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]"
      style={{
        '--portfolio-bg': preset.backgroundColor,
        '--portfolio-text': preset.textColor,
        '--portfolio-accent': preset.accentColor,
        '--portfolio-border': preset.borderColor,
        '--portfolio-card-bg': preset.cardBackground,
        fontFamily: preset.fontFamily,
      } as React.CSSProperties}
      data-testid="photographer-template"
    >
      {/* Hero — centered, image-focused */}
      <div className="px-4 pt-8 md:px-8 md:pt-12">
        <ClassicHero data={data} />
      </div>

      {/* Gallery — lead section for photographers; leads with their work */}
      <div className="px-4 py-6 md:px-8">
        <ClassicGallery data={data} />
      </div>

      {/* Services — pricing / packages */}
      <div className="px-4 py-6 md:px-8">
        <ClassicServices data={data} />
      </div>

      {/* Testimonials — social proof from clients */}
      <div className="px-4 py-6 md:px-8">
        <ClassicTestimonials data={data} />
      </div>

      {/* About — brief bio after the work is shown */}
      <div className="px-4 py-6 md:px-8">
        <ClassicAbout data={data} />
      </div>

      {/* Contact — prominent CTA at the bottom */}
      <div className="px-4 py-6 pb-12 md:px-8">
        <ClassicContact data={data} />
      </div>

      {/* AI — always last */}
      <div className="px-4 py-6 pb-12 md:px-8">
        <ClassicAI data={data} />
      </div>
    </div>
  );
}
