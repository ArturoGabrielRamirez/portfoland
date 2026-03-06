/**
 * modeClasses — Returns Tailwind class strings for dashboard UI elements
 * based on the user's portfolioMode (tech vs classic).
 *
 * Tech Mode: dark bg, cyan accents, monospace
 * Classic Mode: light bg, gray borders, blue accents, readable typography
 */

import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

export function modeClasses(mode: PortfolioMode) {
  const isTech = mode === 'tech';

  return {
    isTech,

    // Page header border
    headerBorder: isTech
      ? 'border-b border-[hsl(174,100%,50%,0.1)]'
      : 'border-b border-gray-200',

    // Section/card container
    card: isTech
      ? 'bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.15)] rounded-sm'
      : 'bg-white border border-gray-200 rounded-lg shadow-sm',

    // Form input field
    input: isTech
      ? 'w-full px-4 py-2.5 bg-[#0D1421] border border-[hsl(174,100%,50%,0.25)] rounded font-mono text-sm text-gray-100 placeholder:text-gray-600 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 focus:outline-none transition-all'
      : 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 focus:outline-none transition-all',

    // Primary add/save button
    primaryButton: isTech
      ? 'flex items-center gap-1.5 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-3 py-1.5 text-xs font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow'
      : 'flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors',

    // Secondary/save button (inside form)
    saveButton: isTech
      ? 'px-4 py-2 bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] font-mono text-xs font-bold hover:opacity-90 transition-opacity'
      : 'px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors',

    // Cancel/secondary button
    cancelButton: isTech
      ? 'px-4 py-2 border border-[hsl(174,100%,50%,0.3)] text-muted-foreground font-mono text-xs hover:border-[hsl(174,100%,50%,0.6)] transition-colors'
      : 'px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors',

    // Danger/delete button
    dangerButton: isTech
      ? 'p-1.5 text-red-500/60 hover:text-red-500 transition-colors'
      : 'p-1.5 text-red-400 hover:text-red-600 transition-colors',

    // Edit button
    editButton: isTech
      ? 'p-1.5 text-muted-foreground hover:text-foreground transition-colors'
      : 'p-1.5 text-gray-400 hover:text-gray-700 transition-colors',

    // Section heading text
    heading: isTech
      ? 'text-2xl font-mono font-bold text-foreground'
      : 'text-2xl font-semibold text-gray-900',

    // Sub-heading / form title
    subHeading: isTech
      ? 'text-sm font-mono font-bold text-foreground uppercase tracking-widest'
      : 'text-sm font-semibold text-gray-800',

    // Label text
    label: isTech
      ? 'text-xs font-mono text-muted-foreground'
      : 'text-xs font-medium text-gray-600',

    // Item card (in list)
    itemCard: isTech
      ? 'flex items-start justify-between p-4 bg-[hsl(200,30%,9%)] border border-[hsl(174,100%,50%,0.1)]'
      : 'flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg',

    // Badge/pill (e.g. Published)
    badge: (published: boolean) => isTech
      ? published
        ? 'text-[10px] font-mono px-2 py-0.5 bg-[hsl(150,100%,45%,0.15)] text-[hsl(150,100%,45%)] border border-[hsl(150,100%,45%,0.3)]'
        : 'text-[10px] font-mono px-2 py-0.5 bg-[hsl(200,30%,12%)] text-muted-foreground border border-[hsl(174,100%,50%,0.1)]'
      : published
        ? 'text-[10px] font-medium px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full'
        : 'text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full',
  };
}
