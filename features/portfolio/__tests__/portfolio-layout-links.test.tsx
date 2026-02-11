/**
 * Portfolio Layout Subdomain-Aware Link Tests
 *
 * Tests that the public portfolio layout adjusts link hrefs based on
 * the presence of the `x-subdomain` header set by the proxy:
 * - Without subdomain: logo links to `/${locale}`, CTA links to `/${locale}/register`
 * - With subdomain: logo links to `https://${APP_DOMAIN}/${locale}`, CTA links to `https://${APP_DOMAIN}/${locale}/register`
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// =============================================================================
// Mocks
// =============================================================================

// Mock next/headers to simulate request headers and cookies
let mockHeaders = new Map<string, string>();

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (key: string) => mockHeaders.get(key) ?? null,
  }),
  cookies: async () => ({
    get: () => undefined,
    set: vi.fn(),
  }),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

// Mock portfolio data layer
vi.mock('@/features/portfolio/data', () => ({
  getPortfolioByUsername: vi.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image: null,
        bio: 'A test bio',
        portfolioMode: 'professional',
        locale: 'en',
      },
      experiences: null,
      skills: null,
      projects: [],
    })
  ),
}));

// Mock next/link to render an anchor tag with the href
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Layout Subdomain-Aware Links', () => {
  beforeEach(() => {
    mockHeaders = new Map<string, string>();
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', 'portfoland.com');
  });

  it('links logo to /${locale} when x-subdomain header is NOT present', async () => {
    // No x-subdomain header -> standard path-based route
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'en', username: 'testuser' }),
    });

    const { container } = render(result);
    const links = container.querySelectorAll('a');
    const logoLink = links[0];

    expect(logoLink).toHaveAttribute('href', '/en');
  });

  it('links logo to https://${NEXT_PUBLIC_APP_DOMAIN}/${locale} when x-subdomain header IS present', async () => {
    mockHeaders.set('x-subdomain', 'testuser');

    vi.resetModules();
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'en', username: 'testuser' }),
    });

    const { container } = render(result);
    const links = container.querySelectorAll('a');
    const logoLink = links[0];

    expect(logoLink).toHaveAttribute('href', 'https://portfoland.com/en');
  });

  it('links CTA to /${locale}/register when x-subdomain header is NOT present', async () => {
    mockHeaders = new Map<string, string>();

    vi.resetModules();
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'es', username: 'testuser' }),
    });

    const { container } = render(result);
    const links = container.querySelectorAll('a');
    const ctaLink = links[1];

    expect(ctaLink).toHaveAttribute('href', '/es/register');
  });

  it('links CTA to https://${NEXT_PUBLIC_APP_DOMAIN}/${locale}/register when x-subdomain header IS present', async () => {
    mockHeaders.set('x-subdomain', 'testuser');

    vi.resetModules();
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'es', username: 'testuser' }),
    });

    const { container } = render(result);
    const links = container.querySelectorAll('a');
    const ctaLink = links[1];

    expect(ctaLink).toHaveAttribute(
      'href',
      'https://portfoland.com/es/register'
    );
  });
});
