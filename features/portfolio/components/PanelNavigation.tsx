/**
 * Panel Navigation Component
 *
 * Tabbed navigation for switching between portfolio sections.
 * Desktop: sidebar nav with one section visible at a time.
 * Mobile: sticky bottom tab bar with scroll-to-section on tap.
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  User,
  FileText,
  Clock,
  Zap,
  FolderOpen,
  Mail,
  Bot,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { PORTFOLIO_SECTIONS } from '../constants/sections';
import type { PanelNavigationProps } from '../types/portfolio';

// =============================================================================
// Icon Map
// =============================================================================

const ICON_MAP = {
  User,
  FileText,
  Clock,
  Zap,
  FolderOpen,
  Mail,
  Bot,
} as const;

// =============================================================================
// Component
// =============================================================================

export function PanelNavigation({
  activeSection,
  onSectionChange,
  mode,
  className,
  sectionOrder = [],
  sectionVisibility = {},
}: PanelNavigationProps) {
  const t = useTranslations('portfolio');

  const isClassic = mode === 'classic';

  return (
    <>
      {/* Desktop: Sidebar navigation */}
      <nav
        className={cn(
          'hidden md:flex md:flex-col md:gap-1 md:py-4 md:px-2',
          'md:w-48 md:shrink-0',
          isClassic
            ? 'bg-white border-r border-gray-200'
            : 'bg-[#0D1117] border-r border-[#1E293B]',
          className
        )}
        role="tablist"
        aria-label="Portfolio sections"
        data-testid="panel-navigation-desktop"
      >
        {(() => {
          // Robust order fallback
          let fullOrder = ['hero', ...sectionOrder, 'contact', 'ai'];
          fullOrder = Array.from(new Set(fullOrder));
          if (sectionOrder.length === 0) {
            fullOrder = PORTFOLIO_SECTIONS.map(s => s.key);
          }

          const isVisible = (key: string) => {
            if (key === 'hero') return true;
            const v = sectionVisibility[key];
            if (key === 'timeline') return v !== false && sectionVisibility['experience'] !== false;
            if (key === 'experience') return v !== false && sectionVisibility['timeline'] !== false;
            return v !== false;
          };

          return fullOrder
            .filter(key => isVisible(key))
            .map((key) => {
              const section = PORTFOLIO_SECTIONS.find(s => s.key === (key === 'experience' ? 'timeline' : key));
              if (!section) return null;

              const Icon = ICON_MAP[section.icon];
              const isActive = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  id={`tab-${section.key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${section.key}`}
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    isClassic && [
                      'focus-visible:ring-blue-500',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ],
                    !isClassic && [
                      'focus-visible:ring-[#00D4FF]',
                      isActive
                        ? 'bg-[#00D4FF]/10 text-[#00D4FF]'
                        : 'text-slate-400 hover:bg-[#1E293B] hover:text-white',
                    ]
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{t(section.labelKey)}</span>
                </button>
              );
            });
        })()}
      </nav>

      {/* Mobile: Sticky bottom tab bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'flex items-center justify-around',
          'border-t',
          isClassic
            ? 'bg-white/95 border-gray-200 backdrop-blur-lg'
            : 'bg-[#0A0E1A]/95 border-[#1E293B] backdrop-blur-lg'
        )}
        role="tablist"
        aria-label="Portfolio sections"
        data-testid="panel-navigation-mobile"
      >
        {(() => {
          let fullOrder = ['hero', ...sectionOrder, 'contact', 'ai'];
          fullOrder = Array.from(new Set(fullOrder));
          if (sectionOrder.length === 0) {
            fullOrder = PORTFOLIO_SECTIONS.map(s => s.key);
          }

          return fullOrder
            .filter(key => sectionVisibility[key] !== false)
            .map((key) => {
              const section = PORTFOLIO_SECTIONS.find(s => s.key === (key === 'experience' ? 'timeline' : key));
              if (!section) return null;

              const Icon = ICON_MAP[section.icon];
              const isActive = activeSection === section.key;

              return (
                <button
                  key={section.key}
                  id={`tab-mobile-${section.key}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`section-${section.key}`}
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                    isClassic && [
                      'focus-visible:ring-blue-500',
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 hover:text-gray-600',
                    ],
                    !isClassic && [
                      'focus-visible:ring-[#00D4FF]',
                      isActive
                        ? 'text-[#00D4FF]'
                        : 'text-slate-500 hover:text-slate-300',
                    ]
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="truncate">{t(section.labelKey)}</span>
                </button>
              );
            });
        })()}
      </nav>
    </>
  );
}
