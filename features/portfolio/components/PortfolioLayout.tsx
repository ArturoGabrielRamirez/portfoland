/**
 * Portfolio Layout Component
 *
 * Master client layout that receives PortfolioData and portfolioMode.
 * Renders PanelNavigation and the active section panel.
 * Desktop: single viewport with overflow-hidden.
 * Mobile: natural document flow with scroll.
 */

'use client';

import { useState } from 'react';
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

// Gaming mode components
import { GamingHero } from './gaming/GamingHero';
import { GamingAbout } from './gaming/GamingAbout';
import { GamingTimeline } from './gaming/GamingTimeline';
import { GamingSkills } from './gaming/GamingSkills';
import { GamingProjects } from './gaming/GamingProjects';
import { GamingContact } from './gaming/GamingContact';
import { GamingAI } from './gaming/GamingAI';

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
// Animation Variants
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

// =============================================================================
// Component
// =============================================================================

export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
  const [activeSection, setActiveSection] = useState<PortfolioSectionKey>(DEFAULT_SECTION);

  const isProfessional = mode === 'professional';

  return (
    <div
      className={cn(
        // Desktop: single viewport, no scroll
        'md:flex md:h-screen md:overflow-hidden',
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
        onSectionChange={(section) => setActiveSection(section as PortfolioSectionKey)}
        mode={mode}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1',
          'md:overflow-y-auto'
        )}
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
              const sections = isProfessional ? professionalSections : gamingSections;
              const SectionComponent = sections[activeSection];
              return <SectionComponent data={data} />;
            })()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
