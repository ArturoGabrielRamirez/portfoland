/**
 * Portfolio Locale Cookie Tests
 *
 * Tests that the public portfolio layout sets the NEXT_LOCALE cookie
 * to the portfolio owner's stored locale on first visit, and does NOT
 * overwrite an existing cookie.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// =============================================================================
// Mocks
// =============================================================================

let mockHeaders = new Map<string, string>();
let mockCookieStore: Record<string, string> = {};
const mockCookieSet = vi.fn();

vi.mock('next/headers', () => ({
  headers: async () => ({
    get: (key: string) => mockHeaders.get(key) ?? null,
  }),
  cookies: async () => ({
    get: (name: string) =>
      mockCookieStore[name] ? { value: mockCookieStore[name] } : undefined,
    set: mockCookieSet,
  }),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

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
        locale: 'es',
      },
      experiences: null,
      skills: null,
      projects: [],
    })
  ),
}));

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

describe('Portfolio Locale Cookie', () => {
  beforeEach(() => {
    mockHeaders = new Map<string, string>();
    mockCookieStore = {};
    mockCookieSet.mockClear();
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', 'portfoland.com');
  });

  it('sets NEXT_LOCALE cookie to owner locale when cookie is not already set', async () => {
    vi.resetModules();
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'es', username: 'testuser' }),
    });

    render(result);

    expect(mockCookieSet).toHaveBeenCalledWith('NEXT_LOCALE', 'es', {
      path: '/',
    });
  });

  it('does NOT overwrite an existing NEXT_LOCALE cookie', async () => {
    mockCookieStore = { NEXT_LOCALE: 'en' };

    vi.resetModules();
    const { default: PublicPortfolioLayout } = await import(
      '@/app/[locale]/[username]/layout'
    );

    const result = await PublicPortfolioLayout({
      children: <div>child content</div>,
      params: Promise.resolve({ locale: 'en', username: 'testuser' }),
    });

    render(result);

    expect(mockCookieSet).not.toHaveBeenCalled();
  });
});
