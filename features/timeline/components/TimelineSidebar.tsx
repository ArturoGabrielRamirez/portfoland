'use client';

/**
 * TimelineSidebar Component
 *
 * Collapsible right sidebar for the timeline view.
 * Shows all experiences in chronological order (newest first).
 * Clicking an entry pans the map to the corresponding pin.
 */

import { cn } from '@/lib/utils';
import type { TimelineSidebarProps } from '../types/experience';
import { EXPERIENCE_COLORS, XP_VALUES } from '../constants/xp';

/** Date formatter for Spanish short month + year */
const dateFormatter = new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' });

/**
 * Format a date range into a readable string
 */
function formatDateRange(startDate: Date, endDate: Date | null | undefined): string {
  const start = dateFormatter.format(new Date(startDate));
  const end = endDate ? dateFormatter.format(new Date(endDate)) : 'Presente';
  return `${start} – ${end}`;
}

/**
 * TimelineSidebar renders a collapsible list of experiences sorted by date descending.
 * When an entry is clicked, onSelect is called to pan the map to that pin.
 */
export function TimelineSidebar({
  experiences,
  selectedExperienceId,
  onSelect,
  isOpen,
  onToggle,
}: TimelineSidebarProps) {
  return (
    <div
      className={cn(
        'flex-shrink-0 flex flex-col border-l border-[hsl(174,100%,50%,0.15)] bg-[hsl(200,30%,6%)] h-full overflow-hidden relative transition-all duration-300',
        isOpen ? 'w-[280px]' : 'w-8'
      )}
    >
      {/* Toggle button — positioned on the left edge */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? 'Colapsar barra lateral' : 'Expandir barra lateral'}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10',
          'flex items-center justify-center',
          'w-5 h-10',
          'bg-[hsl(200,30%,10%)] border border-[hsl(174,100%,50%,0.25)]',
          'text-[hsl(174,100%,50%)] font-mono text-xs',
          'hover:bg-[hsl(174,100%,50%,0.12)] hover:border-[hsl(174,100%,50%,0.5)]',
          'transition-colors duration-150',
          '-translate-x-full'
        )}
      >
        {isOpen ? '›' : '‹'}
      </button>

      {/* Content — only rendered when open */}
      {isOpen && (
        <>
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-[hsl(174,100%,50%,0.12)] flex-shrink-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(174,100%,50%,0.6)]">
              Cronología
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {experiences.length} entradas
            </p>
          </div>

          {/* Scrollable entry list */}
          <div className="flex-1 overflow-y-auto">
            {experiences.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="font-mono text-[10px] text-muted-foreground">
                  Sin experiencias
                </p>
              </div>
            ) : (
              <ul className="py-1">
                {experiences.map((exp) => {
                  const isSelected = exp.id === selectedExperienceId;
                  const dotColor = EXPERIENCE_COLORS[exp.type];
                  const xpValue = XP_VALUES[exp.type];

                  return (
                    <li key={exp.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(exp)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 flex gap-2.5',
                          'hover:bg-[hsl(174,100%,50%,0.04)] transition-colors duration-100',
                          'focus:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(174,100%,50%,0.5)]',
                          isSelected && 'border-l-2 border-[hsl(174,100%,50%)] bg-[hsl(174,100%,50%,0.06)]'
                        )}
                      >
                        {/* Type color dot */}
                        <span
                          className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                          style={{ backgroundColor: dotColor }}
                          aria-hidden="true"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <p
                            className={cn(
                              'font-mono text-[11px] truncate leading-tight',
                              isSelected ? 'text-[hsl(174,100%,50%)]' : 'text-foreground'
                            )}
                          >
                            {exp.title}
                          </p>

                          {/* Company */}
                          <p className="font-mono text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                            {exp.company}
                          </p>

                          {/* Date range */}
                          <p className="font-mono text-[9px] text-muted-foreground/70 mt-1 leading-tight">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </p>

                          {/* XP indicator */}
                          <p
                            className="font-mono text-[9px] mt-1"
                            style={{ color: dotColor }}
                          >
                            +{xpValue} XP
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
