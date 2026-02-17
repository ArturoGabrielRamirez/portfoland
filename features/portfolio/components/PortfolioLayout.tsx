/**
 * Portfolio Layout Component
 *
 * Master client layout that receives PortfolioData and portfolioMode.
 * Renders PanelNavigation and the active section panel.
 * Desktop: fills parent container with sidebar nav and panel switching (no scroll).
 * Mobile: all sections stacked vertically with sticky bottom nav and scroll-to-section.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
  const [activeSection, setActiveSection] = useState<PortfolioSectionKey>(DEFAULT_SECTION);
  const [isBooting, setIsBooting] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // System Boot effect
  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        isProfessional ? 'bg-white text-gray-900' : 'bg-[#0A0E1A] text-white overflow-hidden'
      )}
      data-testid="portfolio-layout"
    >
      {/* CRT Overlay (Gaming Mode only) */}
      {!isProfessional && (
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

      {/* Sidebar / Bottom Navigation */}
      <PanelNavigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        mode={mode}
        sectionOrder={data.user.sectionOrder}
        sectionVisibility={data.user.sectionVisibility}
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
          {(() => {
            const visibility = (data.user.sectionVisibility || {}) as Record<string, boolean>;

            // Check if active section is actually visible
            // Normalize experience/timeline keys
            const isVisible = (key: string) => {
              if (key === 'hero') return true;
              const v = visibility[key];
              if (key === 'timeline') return v !== false && visibility['experience'] !== false;
              if (key === 'experience') return v !== false && visibility['timeline'] !== false;
              return v !== false;
            };

            if (!isVisible(activeSection)) {
              return null;
            }

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
      <div
        className="md:hidden"
        data-testid="mobile-content"
      >
        {(() => {
          // Map user friendly keys to our internal constants if they differ
          // Our User.sectionOrder uses: ['about', 'experience', 'skills', 'projects']
          // internal PORTFOLIO_SECTIONS uses: ['about', 'timeline', 'skills', 'projects']
          // Need to bridge 'experience' -> 'timeline'
          const orderMap: Record<string, string> = {
            'experience': 'timeline'
          };

          const userOrder = data.user.sectionOrder || [];
          const visibility = (data.user.sectionVisibility || {}) as Record<string, boolean>;

          const isVisible = (key: string) => {
            if (key === 'hero') return true;
            const v = visibility[key];
            if (key === 'timeline') return v !== false && visibility['experience'] !== false;
            if (key === 'experience') return v !== false && visibility['timeline'] !== false;
            return v !== false;
          };

          // Build full order: Hero -> User Order -> Contact -> AI
          // This ensures hero/contact/ai always show even if not in reorderable list
          let fullOrder = ['hero', ...userOrder, 'contact', 'ai'];

          // Deduplicate (in case user added hero/contact to order list)
          fullOrder = Array.from(new Set(fullOrder));

          // If userOrder was totally empty, fallback to PORTFOLIO_SECTIONS default list
          if (userOrder.length === 0) {
            fullOrder = PORTFOLIO_SECTIONS.map(s => s.key);
          }

          // Filter and sort sections based on visibility and resolved order
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
                  transition={{
                    ...sectionEntranceTransition,
                    delay: index * 0.05,
                  }}
                  className="scroll-mt-4 p-4"
                >
                  <SectionComponent data={data} />
                </motion.div>
              );
            });
        })()}
      </div>
    </div>
  );
}
