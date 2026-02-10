/**
 * Portfolio Route and Navigation Tests
 *
 * Tests for the public portfolio route and panel-based navigation:
 * - Portfolio page server component returns notFound() for non-existent username
 * - Portfolio page fetches and passes correct portfolioMode to client layout
 * - PanelNavigation renders all 7 section tabs with translated labels
 * - PanelNavigation switches active panel on tab click with Framer Motion animation
 * - Mobile layout renders sticky bottom tab bar at <768px viewport
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// =============================================================================
// Mocks
// =============================================================================

// Mock getPortfolioByUsername
const mockGetPortfolioByUsername = vi.fn();
vi.mock('@/features/portfolio/data', () => ({
  getPortfolioByUsername: (...args: any[]) => mockGetPortfolioByUsername(...args),
}));

// Mock next/navigation
const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/en/testuser',
  useSearchParams: () => new URLSearchParams(),
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
// Test Data
// =============================================================================

const mockPortfolioData = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    image: null,
    bio: 'A test bio',
    portfolioMode: 'professional' as const,
  },
  experiences: null,
  skills: null,
  projects: [],
};

const mockGamingPortfolioData = {
  ...mockPortfolioData,
  user: {
    ...mockPortfolioData.user,
    portfolioMode: 'gaming' as const,
  },
};

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Route and Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Portfolio Page Server Component', () => {
    it('returns notFound() for non-existent username', async () => {
      mockGetPortfolioByUsername.mockResolvedValue(null);

      // Dynamically import the page after mocks are set up
      const { default: PortfolioPage } = await import(
        '@/app/[locale]/[username]/page'
      );

      await expect(
        PortfolioPage({
          params: Promise.resolve({ locale: 'en', username: 'nonexistent' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(mockNotFound).toHaveBeenCalled();
      expect(mockGetPortfolioByUsername).toHaveBeenCalledWith('nonexistent');
    });

    it('fetches and passes correct portfolioMode to client layout', async () => {
      mockGetPortfolioByUsername.mockResolvedValue(mockPortfolioData);

      const { default: PortfolioPage } = await import(
        '@/app/[locale]/[username]/page'
      );

      const result = await PortfolioPage({
        params: Promise.resolve({ locale: 'en', username: 'testuser' }),
      });

      // Verify the PortfolioLayout receives the correct mode prop
      expect(result).toBeDefined();
      expect(result.props.mode).toBe('professional');
      expect(result.props.data).toEqual(mockPortfolioData);
    });
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
          mode="professional"
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
          mode="professional"
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
          mode="gaming"
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
