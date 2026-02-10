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
import type { PortfolioLayoutProps } from '../types/portfolio';
import type { PortfolioSectionKey } from '../constants/sections';

// =============================================================================
// Placeholder Section Components
// =============================================================================

// Placeholder components for sections not yet implemented (Task Groups 6 & 7).
// These render the section name so the layout can be tested and verified.

function PlaceholderSection({
  sectionKey,
  mode,
}: {
  sectionKey: string;
  mode: string;
}) {
  const isProfessional = mode === 'professional';
  const label = PORTFOLIO_SECTIONS.find((s) => s.key === sectionKey)?.key ?? sectionKey;

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center',
        isProfessional ? 'text-gray-500' : 'text-slate-400'
      )}
      data-testid={`section-${sectionKey}`}
    >
      <p className="text-lg font-medium capitalize">{label}</p>
    </div>
  );
}

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
            <PlaceholderSection sectionKey={activeSection} mode={mode} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
