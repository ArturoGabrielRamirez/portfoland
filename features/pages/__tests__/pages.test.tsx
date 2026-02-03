/**
 * Pages Tests (Landing, Dashboard, Language Switcher)
 *
 * TDD approach: These tests define the expected behavior of page components
 * that will be implemented in Task Group 7.2-7.6.
 *
 * Tests are focused on core user flows as per testing standards:
 * - Landing page hero section and CTAs
 * - Dashboard welcome message with user name
 * - Dashboard placeholder feature cards
 * - Language switcher locale options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// TODO: Replace with actual imports once components are implemented in Task 7.2-7.6
// import { LandingPage } from '@/app/[locale]/page';
// import { Dashboard } from '@/app/[locale]/(protected)/dashboard/page';
// import { LanguageSwitcher } from '@/features/i18n/components/LanguageSwitcher';

describe('Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Landing Page', () => {
    it('renders hero section with headline and tagline', () => {
      render(<LandingPageMock />);

      const headline = screen.getByRole('heading', { level: 1 });
      const tagline = screen.getByText(/build your professional/i);

      expect(headline).toBeInTheDocument();
      expect(tagline).toBeInTheDocument();
    });

    it('renders Sign Up and Log In CTA buttons', () => {
      render(<LandingPageMock />);

      const signUpButton = screen.getByRole('link', { name: /sign up/i });
      const logInButton = screen.getByRole('link', { name: /log in/i });

      expect(signUpButton).toBeInTheDocument();
      expect(signUpButton).toHaveAttribute('href', expect.stringContaining('/register'));
      expect(logInButton).toBeInTheDocument();
      expect(logInButton).toHaveAttribute('href', expect.stringContaining('/login'));
    });
  });

  describe('Dashboard', () => {
    it('renders welcome message with user name', () => {
      render(<DashboardMock userName="John Doe" />);

      const welcomeMessage = screen.getByText(/welcome.*john doe/i);
      expect(welcomeMessage).toBeInTheDocument();
    });

    it('renders placeholder feature cards for Timeline, Portfolio, and AI Assistant', () => {
      render(<DashboardMock userName="John Doe" />);

      const timelineCard = screen.getByText(/timeline/i);
      const portfolioCard = screen.getByText(/portfolio/i);
      const aiAssistantCard = screen.getByText(/ai assistant/i);

      expect(timelineCard).toBeInTheDocument();
      expect(portfolioCard).toBeInTheDocument();
      expect(aiAssistantCard).toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    it('renders with locale options and toggles locale on selection', async () => {
      const user = userEvent.setup();
      const onLocaleChange = vi.fn();
      render(<LanguageSwitcherMock currentLocale="en" onLocaleChange={onLocaleChange} />);

      const trigger = screen.getByRole('button', { name: /english/i });
      expect(trigger).toBeInTheDocument();

      await user.click(trigger);

      const spanishOption = screen.getByRole('menuitem', { name: /spanish/i });
      expect(spanishOption).toBeInTheDocument();

      await user.click(spanishOption);
      expect(onLocaleChange).toHaveBeenCalledWith('es');
    });
  });
});

/**
 * Mock Landing Page Component
 *
 * This mock simulates the expected structure of the Landing page
 * that will be created in Task 7.2. Once the real component is implemented,
 * replace this mock with the actual import.
 *
 * Expected component location: app/[locale]/page.tsx
 */
function LandingPageMock() {
  return (
    <main>
      <section aria-label="Hero">
        <h1>Portfoland</h1>
        <p>Build your professional portfolio with AI-powered tools</p>
        <div>
          <a href="/en/register" role="link">
            Sign Up
          </a>
          <a href="/en/login" role="link">
            Log In
          </a>
        </div>
      </section>
      <section aria-label="Features">
        <div>Timeline</div>
        <div>Portfolio</div>
        <div>AI Assistant</div>
      </section>
    </main>
  );
}

/**
 * Mock Dashboard Component
 *
 * This mock simulates the expected structure of the Dashboard page
 * that will be created in Task 7.4-7.5. Once the real component is implemented,
 * replace this mock with the actual import.
 *
 * Expected component location: app/[locale]/(protected)/dashboard/page.tsx
 */
interface DashboardMockProps {
  userName: string;
}

function DashboardMock({ userName }: DashboardMockProps) {
  return (
    <main>
      <header>
        <h1>Welcome, {userName}</h1>
      </header>
      <section aria-label="Feature cards">
        <div className="card">
          <h2>Timeline</h2>
          <span>Coming Soon - v0.2.0</span>
        </div>
        <div className="card">
          <h2>Portfolio</h2>
          <span>Coming Soon - v0.3.0</span>
        </div>
        <div className="card">
          <h2>AI Assistant</h2>
          <span>Coming Soon - v0.4.0</span>
        </div>
      </section>
    </main>
  );
}

/**
 * Mock Language Switcher Component
 *
 * This mock simulates the expected structure of the LanguageSwitcher component
 * that will be created in Task 7.6. Once the real component is implemented,
 * replace this mock with the actual import.
 *
 * Expected component location: features/i18n/components/LanguageSwitcher.tsx
 */
interface LanguageSwitcherMockProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
}

function LanguageSwitcherMock({ currentLocale, onLocaleChange }: LanguageSwitcherMockProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const localeLabels: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
  };

  return (
    <div>
      <button
        aria-label={localeLabels[currentLocale]}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {localeLabels[currentLocale]}
      </button>
      {isOpen && (
        <ul role="menu">
          <li
            role="menuitem"
            aria-label="English"
            onClick={() => {
              onLocaleChange('en');
              setIsOpen(false);
            }}
          >
            English
          </li>
          <li
            role="menuitem"
            aria-label="Spanish"
            onClick={() => {
              onLocaleChange('es');
              setIsOpen(false);
            }}
          >
            Spanish
          </li>
        </ul>
      )}
    </div>
  );
}
