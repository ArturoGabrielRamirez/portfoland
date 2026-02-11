/**
 * Portfolio Layout Component
 *
 * Master client layout that receives PortfolioData and portfolioMode.
 * Renders PanelNavigation and the active section panel.
 * Desktop: fills parent container with sidebar nav and panel switching (no scroll).
 * Mobile: all sections stacked vertically with sticky bottom nav and scroll-to-section.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { PanelNavigation } from './PanelNavigation';
import { DEFAULT_SECTION, PORTFOLIO_SECTIONS } from '../constants/sections';
import type { PortfolioLayoutProps, PortfolioSectionProps } from '../types/portfolio';
import type { PortfolioSectionKey } from '../constants/sections';

// Professional mode components
import { ProfessionalHero } from './professional/ProfessionalHero';
import { ProfessionalAbout } from './professional/ProfessionalAbout';
import { ProfessionalTimeline } from './professional/ProfessionalTimeline';
import { ProfessionalSkills } from './professional/ProfessionalSkills';
import { ProfessionalProjects } from './professional/ProfessionalProjects';
import { ProfessionalContact } from './professional/ProfessionalContact';
import { ProfessionalAI } from './professional/ProfessionalAI';

// Gaming mode components
import { GamingHero } from './gaming/GamingHero';
import { GamingAbout } from './gaming/GamingAbout';
import { GamingTimeline } from './gaming/GamingTimeline';
import { GamingSkills } from './gaming/GamingSkills';
import { GamingProjects } from './gaming/GamingProjects';
import { GamingContact } from './gaming/GamingContact';
import { GamingAI } from './gaming/GamingAI';

// =============================================================================
// Section Component Maps
// =============================================================================

const professionalSections: Record<PortfolioSectionKey, React.ComponentType<PortfolioSectionProps>> = {
  hero: ProfessionalHero,
  about: ProfessionalAbout,
  timeline: ProfessionalTimeline,
  skills: ProfessionalSkills,
  projects: ProfessionalProjects,
  contact: ProfessionalContact,
  ai: ProfessionalAI,
};

const gamingSections: Record<PortfolioSectionKey, React.ComponentType<PortfolioSectionProps>> = {
  hero: GamingHero,
  about: GamingAbout,
  timeline: GamingTimeline,
  skills: GamingSkills,
  projects: GamingProjects,
  contact: GamingContact,
  ai: GamingAI,
};

// =============================================================================
// Animation Variants (performant: transform/opacity only)
// =============================================================================

const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const panelTransition = {
  duration: 0.2,
  ease: 'easeInOut',
};

const sectionEntranceVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const sectionEntranceTransition = {
  duration: 0.3,
  ease: 'easeOut',
};

// =============================================================================
// Component
// =============================================================================

export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
  const [activeSection, setActiveSection] = useState<PortfolioSectionKey>(DEFAULT_SECTION);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const isProfessional = mode === 'professional';
  const sections = isProfessional ? professionalSections : gamingSections;

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section as PortfolioSectionKey);

    // On mobile, scroll to the section element
    const el = sectionRefs.current[section];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div
      className={cn(
        // Desktop: fill parent container, no scroll, flex row for sidebar + content
        'md:flex md:h-full md:overflow-hidden',
        // Mobile: natural flow with scroll, add padding for bottom nav
        'min-h-screen pb-16 md:pb-0',
        // Mode-based background
        isProfessional ? 'bg-white text-gray-900' : 'bg-[#0A0E1A] text-white'
      )}
      data-testid="portfolio-layout"
    >
      {/* Sidebar / Bottom Navigation */}
      <PanelNavigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        mode={mode}
      />

      {/* Desktop: Panel-based content (one section at a time) */}
      <main
        className={cn(
          'hidden md:block',
          'flex-1',
          'md:overflow-y-auto'
        )}
        data-testid="desktop-content"
      >
        <AnimatePresence mode="wait">
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
            {(() => {
              const SectionComponent = sections[activeSection];
              return <SectionComponent data={data} />;
            })()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile: All sections stacked vertically */}
      <div
        className="md:hidden"
        data-testid="mobile-content"
      >
        {PORTFOLIO_SECTIONS.map((section, index) => {
          const SectionComponent = sections[section.key];
          return (
            <motion.div
              key={section.key}
              ref={(el) => { sectionRefs.current[section.key] = el; }}
              id={`section-${section.key}`}
              variants={sectionEntranceVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                ...sectionEntranceTransition,
                delay: index * 0.05,
              }}
              className="scroll-mt-4 p-4"
            >
              <SectionComponent data={data} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
