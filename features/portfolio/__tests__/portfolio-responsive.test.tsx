/**
 * Portfolio Responsive Layout Tests
 *
 * Tests for responsive behavior and cross-mode integration:
 * - Desktop viewport (>=768px) renders portfolio in single viewport with no vertical scrollbar
 * - Mobile viewport (<768px) renders stacked sections with sticky bottom navigation
 * - PortfolioLayout correctly switches between Classic and Tech component sets based on portfolioMode prop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// =============================================================================
// Mocks
// =============================================================================

// Mock framer-motion to render without actual animations
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  motion: {
    div: ({
      children,
      className,
      id,
      role,
      ...props
    }: any) => (
      <div
        data-testid="motion-div"
        className={className}
        id={id}
        role={role}
        aria-labelledby={props['aria-labelledby']}
      >
        {children}
      </div>
    ),
  },
}));

// Mock tech components
vi.mock('@/features/tech', () => ({
  TechCard: ({ children, variant, className, ...props }: any) => (
    <div data-testid={props['data-testid'] || 'tech-card'} data-variant={variant} className={className}>
      {children}
    </div>
  ),
  TechAvatar: (props: any) => <div data-testid="tech-avatar" data-frame={props.frame} />,
  TechBadge: ({ children }: any) => <span data-testid="tech-badge">{children}</span>,
  LevelBadge: (props: any) => <span data-testid="level-badge">Lv.{props.level}</span>,
  HUDPanel: ({ children, title, className }: any) => (
    <div data-testid="hud-panel" className={className}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
  TechButton: ({ children }: any) => <button data-testid="tech-button">{children}</button>,
  StatCard: (props: any) => <div data-testid="stat-card">{props.value}</div>,
}));

// Mock TimelineMap
vi.mock('@/features/timeline/components', () => ({
  TimelineMap: (props: any) => (
    <div data-testid="timeline-map" data-editable={props.isEditable?.toString()}>
      TimelineMap
    </div>
  ),
}));

// Mock SkillTreeView
vi.mock('@/features/skills/components', () => ({
  SkillTreeView: (props: any) => (
    <div data-testid="skill-tree-view" data-editable={props.isEditable?.toString()}>
      SkillTreeView
    </div>
  ),
}));

// =============================================================================
// Test Data
// =============================================================================

const mockPortfolioData: PortfolioData = {
  user: {
    id: 'user-1',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    image: null,
    bio: 'A test biography for the portfolio.',
    portfolioMode: 'classic' as const,
    locale: 'en',
    sectionOrder: [],
    contactLinks: {},
    sectionVisibility: {},
  },
  experiences: null,
  skills: null,
  projects: [],
};

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Responsive Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('desktop viewport (>=768px) renders portfolio in single viewport with no vertical scrollbar', async () => {
    const { PortfolioLayout } = await import('../components/PortfolioLayout');

    const { container } = render(
      <PortfolioLayout data={mockPortfolioData} mode="classic" />
    );

    const layoutWrapper = screen.getByTestId('portfolio-layout');

    // Desktop layout fills parent (h-full) with overflow-hidden to prevent scrollbar
    expect(layoutWrapper).toHaveClass('md:h-full');
    expect(layoutWrapper).toHaveClass('md:overflow-hidden');
    expect(layoutWrapper).toHaveClass('md:flex');

    // Desktop sidebar navigation has fixed width
    const desktopNav = screen.getByTestId('panel-navigation-desktop');
    expect(desktopNav).toBeInTheDocument();
    expect(desktopNav).toHaveClass('md:w-48');
    expect(desktopNav).toHaveClass('md:shrink-0');

    // Desktop content area allows internal scrolling if panel content overflows
    const desktopContent = screen.getByTestId('desktop-content');
    expect(desktopContent).toBeInTheDocument();
    expect(desktopContent).toHaveClass('md:overflow-y-auto');
    expect(desktopContent).toHaveClass('flex-1');

    // AnimatePresence wraps the active panel for desktop
    const animatePresence = within(desktopContent).getByTestId('animate-presence');
    expect(animatePresence).toBeInTheDocument();
  });

  it('mobile viewport (<768px) renders stacked sections with sticky bottom navigation', async () => {
    const { PortfolioLayout } = await import('../components/PortfolioLayout');

    render(
      <PortfolioLayout data={mockPortfolioData} mode="classic" />
    );

    // Mobile bottom navigation has fixed positioning
    const mobileNav = screen.getByTestId('panel-navigation-mobile');
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveClass('fixed');
    expect(mobileNav).toHaveClass('bottom-0');
    expect(mobileNav).toHaveClass('left-0');
    expect(mobileNav).toHaveClass('right-0');
    expect(mobileNav).toHaveClass('z-50');

    // Mobile tabs have minimum touch targets of 44x44px
    const mobileTabs = within(mobileNav).getAllByRole('tab');
    expect(mobileTabs.length).toBe(7);
    mobileTabs.forEach((tab) => {
      expect(tab).toHaveClass('min-h-[44px]');
      expect(tab).toHaveClass('min-w-[44px]');
    });

    // Mobile content area renders all 7 sections stacked vertically
    const mobileContent = screen.getByTestId('mobile-content');
    expect(mobileContent).toBeInTheDocument();
    expect(mobileContent).toHaveClass('md:hidden');

    // All 7 sections are rendered within the mobile content area
    const mobileSections = within(mobileContent).getAllByTestId('motion-div');
    expect(mobileSections.length).toBe(7);

    // Layout has bottom padding to accommodate the fixed bottom nav on mobile
    const layoutWrapper = screen.getByTestId('portfolio-layout');
    expect(layoutWrapper).toHaveClass('pb-16');
    expect(layoutWrapper).toHaveClass('min-h-screen');
  });

  it('PortfolioLayout correctly switches between Classic and Tech component sets based on portfolioMode prop', async () => {
    const { PortfolioLayout } = await import('../components/PortfolioLayout');

    // Render in classic mode
    const { unmount } = render(
      <PortfolioLayout data={mockPortfolioData} mode="classic" />
    );

    const layoutClassic = screen.getByTestId('portfolio-layout');

    // Classic mode: white background, gray text
    expect(layoutClassic).toHaveClass('bg-white');
    expect(layoutClassic).toHaveClass('text-gray-900');

    // Should render classic hero content (h1 with user name in desktop panel)
    const desktopContent = screen.getByTestId('desktop-content');
    const heading = within(desktopContent).getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test User');

    // No tech components should be present
    expect(screen.queryByTestId('tech-hero-card')).not.toBeInTheDocument();

    unmount();

    // Render in tech mode
    const techData: PortfolioData = {
      ...mockPortfolioData,
      user: { ...mockPortfolioData.user, portfolioMode: 'tech' },
    };

    render(
      <PortfolioLayout data={techData} mode="tech" />
    );

    const layoutTech = screen.getByTestId('portfolio-layout');

    // Tech mode: dark background, white text
    expect(layoutTech).toHaveClass('bg-[#0A0E1A]');
    expect(layoutTech).toHaveClass('text-white');

    // Should render tech hero content (TechCard is present via mock)
    const techCards = screen.getAllByTestId('tech-hero-card');
    expect(techCards.length).toBeGreaterThan(0);

    // Tech desktop also renders the heading
    const techDesktop = screen.getByTestId('desktop-content');
    const techHeading = within(techDesktop).getByRole('heading', { level: 1 });
    expect(techHeading).toHaveTextContent('Test User');
  });
});
