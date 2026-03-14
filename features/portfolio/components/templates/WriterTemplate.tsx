/**
 * WriterTemplate
 *
 * Classic Mode layout variant for writers (bloggers, journalists, authors, copywriters).
 * Section order: Hero → About → Timeline → Projects → Skills → Contact
 * Gallery is omitted — not relevant for text-based work.
 *
 * About and Timeline are prominently placed early to highlight the writing
 * career and publication history before showing skills.
 *
 * Reuses existing Classic section components with no CSS changes.
 */

import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import type { PortfolioData } from '../../types/portfolio';
import { ClassicHero } from '../classic/ClassicHero';
import { ClassicAbout } from '../classic/ClassicAbout';
import { ClassicTimeline } from '../classic/ClassicTimeline';
import { ClassicProjects } from '../classic/ClassicProjects';
import { ClassicSkills } from '../classic/ClassicSkills';
import { ClassicTestimonials } from '../classic/ClassicTestimonials';
import { ClassicContact } from '../classic/ClassicContact';
import { ClassicAI } from '../classic/ClassicAI';

// =============================================================================
// Types
// =============================================================================

interface WriterTemplateProps {
  data: PortfolioData;
}

// =============================================================================
// Component
// =============================================================================

export function WriterTemplate({ data }: WriterTemplateProps) {
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
      data-testid="writer-template"
    >
      {/* Hero — bio and name are the primary identity for writers */}
      <div className="px-4 pt-8 md:px-8 md:pt-12">
        <ClassicHero data={data} />
      </div>

      {/* About — expanded bio is the writer's primary selling point */}
      <div className="px-4 py-6 md:px-8">
        <ClassicAbout data={data} />
      </div>

      {/* Timeline — publication history / career experience */}
      <div className="px-4 py-6 md:px-8">
        <ClassicTimeline data={data} />
      </div>

      {/* Projects — published works, articles, or books */}
      <div className="px-4 py-6 md:px-8">
        <ClassicProjects data={data} />
      </div>

      {/* Skills — minimal: writing tools, languages, genres */}
      <div className="px-4 py-6 md:px-8">
        <ClassicSkills data={data} />
      </div>

      {/* Testimonials — editor/client endorsements */}
      <div className="px-4 py-6 md:px-8">
        <ClassicTestimonials data={data} />
      </div>

      {/* Contact — newsletter / collaboration CTA */}
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
