/**
 * Portfolio Layout Component
 *
 * Thin router that resolves the effective view mode from PortfolioSettings
 * and delegates rendering to the appropriate template component.
 *
 * Classic Mode also checks layoutVariant to render profession-specific
 * templates (photographer, designer, writer) before falling through to
 * the standard view mode templates.
 */

'use client';

import type { PortfolioLayoutProps, PortfolioViewMode } from '../types/portfolio';
import { SectionsTemplate } from './templates/SectionsTemplate';
import { OnePageTemplate } from './templates/OnePageTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { TerminalTemplate } from './templates/TerminalTemplate';
import { PhotographerTemplate } from './templates/PhotographerTemplate';
import { DesignerTemplate } from './templates/DesignerTemplate';
import { WriterTemplate } from './templates/WriterTemplate';

export function PortfolioLayout({ data, mode }: PortfolioLayoutProps) {
  const rawViewMode = (data.settings?.viewMode ?? 'sections') as PortfolioViewMode;
  // Terminal is only valid for Tech Mode; fall back to sections for Classic users
  const viewMode: PortfolioViewMode =
    rawViewMode === 'terminal' && mode !== 'tech' ? 'sections' : rawViewMode;

  // Classic Mode layout variant templates — checked before view mode routing
  // so that profession-specific layouts take priority over generic view modes.
  if (mode === 'classic') {
    const layoutVariant = data.settings?.layoutVariant ?? 'default';
    if (layoutVariant === 'photographer') return <PhotographerTemplate data={data} />;
    if (layoutVariant === 'designer') return <DesignerTemplate data={data} />;
    if (layoutVariant === 'writer') return <WriterTemplate data={data} />;
  }

  if (viewMode === 'one_page') return <OnePageTemplate data={data} mode={mode} />;
  if (viewMode === 'minimal') return <MinimalTemplate data={data} mode={mode} />;
  if (viewMode === 'terminal') return <TerminalTemplate data={data} mode={mode} />;
  return <SectionsTemplate data={data} mode={mode} />;
}
