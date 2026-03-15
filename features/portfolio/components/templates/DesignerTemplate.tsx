/**
 * DesignerTemplate
 *
 * Classic Mode layout variant for designers (UI/UX, graphic, product, etc.).
 * Section order: Hero → Gallery → Skills → Projects → About → Services → Contact
 * Timeline is omitted — work portfolio and tools take precedence.
 *
 * Reuses existing Classic section components with no CSS changes.
 */

import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import type { PortfolioData } from '../../types/portfolio';
import { ClassicHero } from '../classic/ClassicHero';
import { ClassicGallery } from '../classic/ClassicGallery';
import { ClassicSkills } from '../classic/ClassicSkills';
import { ClassicProjects } from '../classic/ClassicProjects';
import { ClassicAbout } from '../classic/ClassicAbout';
import { ClassicServices } from '../classic/ClassicServices';
import { ClassicTestimonials } from '../classic/ClassicTestimonials';
import { ClassicContact } from '../classic/ClassicContact';
import { ClassicAI } from '../classic/ClassicAI';

// =============================================================================
// Types
// =============================================================================

interface DesignerTemplateProps {
  data: PortfolioData;
}

// =============================================================================
// Component
// =============================================================================

export function DesignerTemplate({ data }: DesignerTemplateProps) {
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
      data-testid="designer-template"
    >
      {/* Hero — clean, typography-focused */}
      <div className="px-4 pt-8 md:px-8 md:pt-12">
        <ClassicHero data={data} />
      </div>

      {/* Gallery — design portfolio pieces come first */}
      <div className="px-4 py-6 md:px-8">
        <ClassicGallery data={data} />
      </div>

      {/* Skills — displayed as a visual grid; tools matter to designers */}
      <div className="px-4 py-6 md:px-8">
        <ClassicSkills data={data} />
      </div>

      {/* Projects — featured work with descriptions */}
      <div className="px-4 py-6 md:px-8">
        <ClassicProjects data={data} />
      </div>

      {/* About — context after the work has spoken */}
      <div className="px-4 py-6 md:px-8">
        <ClassicAbout data={data} />
      </div>

      {/* Services — design packages or freelance offerings */}
      <div className="px-4 py-6 md:px-8">
        <ClassicServices data={data} />
      </div>

      {/* Testimonials — client validation */}
      <div className="px-4 py-6 md:px-8">
        <ClassicTestimonials data={data} />
      </div>

      {/* Contact */}
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
