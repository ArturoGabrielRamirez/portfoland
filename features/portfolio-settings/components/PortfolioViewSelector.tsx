'use client';

/**
 * PortfolioViewSelector
 *
 * Dashboard UI for selecting the portfolio view mode.
 * 4 option cards: Sections, One Page, Minimal, Terminal.
 * Terminal card is visually disabled for Classic Mode users.
 */

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Layers, FileText, Minimize2, Terminal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { HUDPanel } from '@/features/dashboard/components/HUDPanel';
import { updatePortfolioViewModeAction } from '@/features/portfolio-settings/actions/portfolioSettingsActions';
import type { PortfolioViewMode, PortfolioMode } from '@/features/portfolio/types/portfolio';

// =============================================================================
// Types
// =============================================================================

interface PortfolioViewSelectorProps {
  currentViewMode: PortfolioViewMode;
  portfolioMode: PortfolioMode;
}

// =============================================================================
// Card Definitions
// =============================================================================

const VIEW_MODE_CARDS = [
  {
    id: 'sections' as PortfolioViewMode,
    label: 'Sections',
    description: 'Tabbed panel navigation',
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: 'one_page' as PortfolioViewMode,
    label: 'One Page',
    description: 'Single scroll page',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: 'minimal' as PortfolioViewMode,
    label: 'Minimal',
    description: 'Name, bio, links only',
    icon: <Minimize2 className="w-5 h-5" />,
  },
  {
    id: 'terminal' as PortfolioViewMode,
    label: 'Terminal',
    description: 'Full CRT experience',
    icon: <Terminal className="w-5 h-5" />,
  },
];

// =============================================================================
// Component
// =============================================================================

export function PortfolioViewSelector({ currentViewMode, portfolioMode }: PortfolioViewSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [activeMode, setActiveMode] = useState<PortfolioViewMode>(currentViewMode);

  function handleSelect(viewMode: PortfolioViewMode) {
    const isTerminalDisabled = viewMode === 'terminal' && portfolioMode !== 'tech';
    if (isTerminalDisabled) return;

    setActiveMode(viewMode);
    startTransition(async () => {
      const result = await updatePortfolioViewModeAction(viewMode);
      if (result.hasError) {
        toast.error(result.message);
        setActiveMode(currentViewMode); // revert on error
      } else {
        toast.success('View mode updated');
      }
    });
  }

  return (
    <HUDPanel title="View Mode" icon={<Terminal className="w-4 h-4" />}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {VIEW_MODE_CARDS.map((card) => {
          const isTerminalDisabled = card.id === 'terminal' && portfolioMode !== 'tech';
          const isActive = activeMode === card.id;

          return (
            <button
              key={card.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(card.id)}
              title={isTerminalDisabled ? 'Tech Mode only' : undefined}
              className={cn(
                'flex flex-col gap-2 p-3 border rounded-sm text-left transition-all',
                isActive
                  ? 'border-[hsl(174,100%,50%,0.5)] bg-[hsl(174,100%,50%,0.08)]'
                  : 'border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,8%)] hover:border-[hsl(174,100%,50%,0.3)]',
                isTerminalDisabled && 'opacity-40 cursor-not-allowed hover:border-[hsl(174,100%,50%,0.15)]',
                isPending && 'opacity-70'
              )}
            >
              {/* Icon + Active badge row */}
              <div className="flex items-center gap-1.5 text-[#00D4FF]">
                {card.icon}
                {isActive && (
                  <span className="text-[hsl(150,100%,45%)] bg-[hsl(150,100%,45%,0.1)] text-[10px] font-mono px-1.5 py-0.5 rounded-sm uppercase ml-auto">
                    Active
                  </span>
                )}
              </div>
              {/* Label */}
              <span className="text-xs font-mono text-gray-200">{card.label}</span>
              {/* Description */}
              <span className="text-[10px] font-mono text-gray-400 leading-tight">{card.description}</span>
            </button>
          );
        })}
      </div>
    </HUDPanel>
  );
}
