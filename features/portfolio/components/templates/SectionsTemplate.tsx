/**
 * SectionsTemplate
 *
 * Extracted from PortfolioLayout — the default "sections" view mode.
 * Desktop: sidebar nav + panel switching (no scroll).
 * Mobile: all sections stacked vertically with sticky bottom nav.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { PanelNavigation } from '../PanelNavigation';
import { DEFAULT_SECTION, PORTFOLIO_SECTIONS } from '../../constants/sections';
import type { PortfolioSectionProps, PortfolioMode } from '../../types/portfolio';
import type { PortfolioSectionKey } from '../../constants/sections';
import type { PortfolioData } from '../../types/portfolio';
import { THEME_PRESETS } from '@/features/portfolio-settings/constants/themes';
import { VisitorRoleBar, type VisitorRole } from '../VisitorRoleBar';
import { RecruiterView } from '../RecruiterView';
import { RoleBanner } from '../RoleBanner';

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
// Animation Variants
// =============================================================================

const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const panelTransition = {
  duration: 0.2,
  ease: 'easeInOut' as const,
};

const sectionEntranceVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const sectionEntranceTransition = {
  duration: 0.3,
  ease: 'easeOut' as const,
};

// =============================================================================
// Component
// =============================================================================

interface SectionsTemplateProps {
  data: PortfolioData;
  mode: PortfolioMode;
}

export function SectionsTemplate({ data, mode }: SectionsTemplateProps) {
  const [activeSection, setActiveSection] = useState<PortfolioSectionKey>(DEFAULT_SECTION);
  const [isBooting, setIsBooting] = useState(mode !== 'classic');
  const [visitorRole, setVisitorRole] = useState<VisitorRole>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (mode === 'classic') return;
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, [mode]);

  const isClassic = mode === 'classic';
  const sections = isClassic ? classicSections : techSections;
  
  // Resolve Theme
  const isCustomTheme = data.settings?.theme === 'custom' && data.settings?.customTheme;
  const preset = isCustomTheme 
    ? (data.settings!.customTheme as any) // Shape matches ThemePreset's color fields
    : (THEME_PRESETS[data.settings?.theme ?? 'default'] ?? THEME_PRESETS['default']);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section as PortfolioSectionKey);
    const el = sectionRefs.current[section];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col md:h-full',
        'min-h-screen pb-16 md:pb-0',
        isClassic ? 'bg-[var(--portfolio-bg)] text-[var(--portfolio-text)]' : 'bg-[#0A0E1A] text-white overflow-hidden'
      )}
      style={isClassic ? {
        '--portfolio-bg': preset.backgroundColor,
        '--portfolio-text': preset.textColor,
        '--portfolio-accent': preset.accentColor,
        '--portfolio-border': preset.borderColor,
        '--portfolio-card-bg': preset.cardBackground,
        fontFamily: preset.fontFamily,
      } as React.CSSProperties : undefined}
      data-testid="portfolio-layout"
    >
      {/* CRT Overlay (Tech Mode only) */}
      {!isClassic && (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
          <div className="crt-lines absolute inset-0 opacity-[0.03]" />
          <div className="crt-scanner" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D4FF]/[0.02] to-transparent animate-scanline-flash opacity-20" />
        </div>
      )}

      {/* Boot Screen Overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0E1A] font-mono text-[#00D4FF]"
          >
            <div className="flex flex-col gap-2 w-64">
              <div className="text-xs uppercase tracking-widest opacity-60">Initializing System...</div>
              <div className="h-1 w-full bg-[#1E293B] rounded-full overflow-hidden">
                <div className="h-full bg-[#00D4FF] animate-boot-line" />
              </div>
              <div className="text-[10px] text-[#64748B] flex justify-between">
                <span>BOOT_SEQUENCE_v0.4.0</span>
                <span className="animate-pulse">LOADING...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visitor Role Selector */}
      <VisitorRoleBar role={visitorRole} onRoleChange={setVisitorRole} mode={mode} />

      {/* Recruiter Mode: ATS-friendly full-page view */}
      {visitorRole === 'recruiter' ? (
        <RecruiterView data={data} mode={mode} />
      ) : (
        <>
          {/* Role Banner (non-recruiter contextual message) */}
          <RoleBanner role={visitorRole} mode={mode} />

          {/* Main portfolio content */}
          <div className="flex-1 md:flex md:overflow-hidden md:min-h-0">
            {/* Sidebar / Bottom Navigation */}
            <PanelNavigation
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              mode={mode}
              sectionOrder={data.user.sectionOrder}
              sectionVisibility={data.user.sectionVisibility}
            />

            {/* Desktop: Panel-based content */}
            <main
              className={cn('hidden md:block', 'flex-1', 'md:overflow-y-auto')}
              data-testid="desktop-content"
            >
              <AnimatePresence mode="wait">
                {(() => {
                  const visibility = (data.user.sectionVisibility || {}) as Record<string, boolean>;
                  const isVisible = (key: string) => {
                    if (key === 'hero') return true;
                    const v = visibility[key];
                    if (key === 'timeline') return v !== false && visibility['experience'] !== false;
                    if (key === 'experience') return v !== false && visibility['timeline'] !== false;
                    return v !== false;
                  };

                  if (!isVisible(activeSection)) return null;

                  const SectionComponent = sections[activeSection];
                  if (!SectionComponent) return null;

                  return (
                    <motion.div
                      key={activeSection}
                      variants={panelVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={panelTransition}
                      id={`panel-${activeSection}`}
                      role="tabpanel"
                      aria-labelledby={`tab-${activeSection}`}
                      className="h-full p-4 md:p-6"
                    >
                      <SectionComponent data={data} />
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </main>

            {/* Mobile: All sections stacked vertically */}
            <div className="md:hidden" data-testid="mobile-content">
              {(() => {
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

                return fullOrder
                  .filter(key => isVisible(key))
                  .map((userKey, index) => {
                    const internalKey = (orderMap[userKey] || userKey) as PortfolioSectionKey;
                    const SectionComponent = sections[internalKey];
                    if (!SectionComponent) return null;

                    return (
                      <motion.div
                        key={internalKey}
                        ref={(el) => { sectionRefs.current[internalKey] = el; }}
                        id={`section-${internalKey}`}
                        variants={sectionEntranceVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ ...sectionEntranceTransition, delay: index * 0.05 }}
                        className="scroll-mt-4 p-4"
                      >
                        <SectionComponent data={data} />
                      </motion.div>
                    );
                  });
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
