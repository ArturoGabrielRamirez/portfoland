/**
 * Portfolio Layout Component
 *
 * Thin router that resolves the effective view mode from PortfolioSettings
 * and delegates rendering to the appropriate template component.
 */

'use client';

import type { PortfolioLayoutProps, PortfolioViewMode } from '../types/portfolio';
import { SectionsTemplate } from './templates/SectionsTemplate';
import { OnePageTemplate } from './templates/OnePageTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { TerminalTemplate } from './templates/TerminalTemplate';

export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
  const rawViewMode = (data.settings?.viewMode ?? 'sections') as PortfolioViewMode;
  // Terminal is only valid for Tech Mode; fall back to sections for Classic users
  const viewMode: PortfolioViewMode =
    rawViewMode === 'terminal' && mode !== 'tech' ? 'sections' : rawViewMode;

  if (viewMode === 'one_page') return <OnePageTemplate data={data} mode={mode} />;
  if (viewMode === 'minimal') return <MinimalTemplate data={data} mode={mode} />;
  if (viewMode === 'terminal') return <TerminalTemplate data={data} mode={mode} />;
  return <SectionsTemplate data={data} mode={mode} />;
}
