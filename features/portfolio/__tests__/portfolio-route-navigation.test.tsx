/**
 * Portfolio Route and Navigation Tests
 *
 * Tests for the public portfolio panel-based navigation:
 * - PanelNavigation renders all 7 section tabs with translated labels
 * - PanelNavigation switches active panel on tab click with Framer Motion animation
 * - Mobile layout renders sticky bottom tab bar at <768px viewport
 *
 * Note: The [username]/page.tsx is now a redirect page (UsernameRedirect),
 * so the server component tests that tested PortfolioPage have been removed.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// =============================================================================
// Mocks
// =============================================================================

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/en/testuser',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

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
        data-motion-key={props['key']}
        className={className}
        id={id}
        role={role}
      >
        {children}
      </div>
    ),
  },
}));

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Route and Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PanelNavigation Component', () => {
    it('renders all 7 section tabs with translated labels', async () => {
      const { PanelNavigation } = await import(
        '../components/PanelNavigation'
      );

      render(
        <PanelNavigation
          activeSection="hero"
          onSectionChange={vi.fn()}
          mode="classic"
        />
      );

      // Desktop navigation should have 7 tabs
      const desktopNav = screen.getByTestId('panel-navigation-desktop');
      const desktopTabs = within(desktopNav).getAllByRole('tab');
      expect(desktopTabs).toHaveLength(7);

      // Verify all navigation labels are rendered (translations return the key)
      const expectedLabels = [
        'nav.hero',
        'nav.about',
        'nav.timeline',
        'nav.skills',
        'nav.projects',
        'nav.contact',
        'nav.ai',
      ];

      expectedLabels.forEach((label) => {
        expect(desktopNav).toHaveTextContent(label);
      });
    });

    it('switches active panel on tab click', async () => {
      const mockOnSectionChange = vi.fn();

      const { PanelNavigation } = await import(
        '../components/PanelNavigation'
      );

      render(
        <PanelNavigation
          activeSection="hero"
          onSectionChange={mockOnSectionChange}
          mode="classic"
        />
      );

      const desktopNav = screen.getByTestId('panel-navigation-desktop');
      const tabs = within(desktopNav).getAllByRole('tab');

      // Click on the "About" tab (index 1)
      fireEvent.click(tabs[1]);
      expect(mockOnSectionChange).toHaveBeenCalledWith('about');

      // Click on the "Skills" tab (index 3)
      fireEvent.click(tabs[3]);
      expect(mockOnSectionChange).toHaveBeenCalledWith('skills');

      // Verify the active tab has aria-selected="true"
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true'); // hero is active
    });

    it('renders sticky bottom tab bar for mobile', async () => {
      const { PanelNavigation } = await import(
        '../components/PanelNavigation'
      );

      render(
        <PanelNavigation
          activeSection="hero"
          onSectionChange={vi.fn()}
          mode="tech"
        />
      );

      // Mobile navigation should exist
      const mobileNav = screen.getByTestId('panel-navigation-mobile');
      expect(mobileNav).toBeInTheDocument();

      // Mobile nav should have fixed positioning classes
      expect(mobileNav).toHaveClass('fixed', 'bottom-0');

      // Mobile nav should have 7 tabs
      const mobileTabs = within(mobileNav).getAllByRole('tab');
      expect(mobileTabs).toHaveLength(7);

      // Mobile tabs should have minimum touch target size
      mobileTabs.forEach((tab) => {
        expect(tab).toHaveClass('min-h-[44px]', 'min-w-[44px]');
      });
    });
  });
});
