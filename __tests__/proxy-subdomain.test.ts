/**
 * Proxy Subdomain Detection & Rewriting Tests
 *
 * Tests for subdomain extraction, URL rewriting, reserved subdomain
 * passthrough, and non-portfolio path redirect behavior in proxy.ts.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (hoisted by Vitest before any imports)
// ---------------------------------------------------------------------------

// Track calls to NextResponse methods and capture response objects
const mockRewriteUrls: URL[] = [];
const mockRedirectUrls: URL[] = [];
const mockRewriteResponses: any[] = [];
let mockNextCalled = false;

vi.mock('better-auth/cookies', () => ({
  getSessionCookie: vi.fn(() => null),
}));

vi.mock('@/features/core', () => ({
  isReservedSubdomain: (name: string) => {
    const reserved = [
      'www', 'app', 'api', 'admin', 'mail', 'staging', 'dev', 'test',
      'beta', 'status', 'docs', 'help', 'support', 'blog', 'cdn',
      'static', 'assets', 'media',
    ];
    return reserved.includes(name.toLowerCase());
  },
}));

vi.mock('next/server', () => {
  return {
    NextResponse: {
      rewrite: (url: URL) => {
        mockRewriteUrls.push(url);
        const headerStore = new Map<string, string>();
        const response = {
          _type: 'rewrite',
          headers: {
            set: (k: string, v: string) => headerStore.set(k, v),
            get: (k: string) => headerStore.get(k),
          },
          _headers: headerStore,
        };
        mockRewriteResponses.push(response);
        return response;
      },
      redirect: (url: URL) => {
        mockRedirectUrls.push(url);
        return { _type: 'redirect' };
      },
      next: () => {
        mockNextCalled = true;
        return { _type: 'next' };
      },
    },
  };
});

// Set env before the proxy function reads it at call time
process.env.NEXT_PUBLIC_APP_DOMAIN = 'portfoland.com';

// Static import -- the vi.mock calls above are hoisted, so the proxy module
// will already see the mocked next/server and @/features/core.
import { extractSubdomain, proxy } from '@/proxy';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRequest(url: string, host: string, options?: {
  localeCookie?: string;
  acceptLanguage?: string;
}): any {
  const urlObj = new URL(url);
  const headers = new Map<string, string>();
  headers.set('host', host);
  if (options?.acceptLanguage) {
    headers.set('accept-language', options.acceptLanguage);
  }

  const cookies = new Map<string, { value: string }>();
  if (options?.localeCookie) {
    cookies.set('NEXT_LOCALE', { value: options.localeCookie });
  }

  return {
    url,
    nextUrl: {
      pathname: urlObj.pathname,
    },
    headers: {
      get: (key: string) => headers.get(key.toLowerCase()) ?? null,
    },
    cookies: {
      get: (key: string) => cookies.get(key) ?? undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// extractSubdomain unit tests
// ---------------------------------------------------------------------------

describe('extractSubdomain', () => {
  it('extracts "john" from "john.portfoland.com" with base "portfoland.com"', () => {
    expect(extractSubdomain('john.portfoland.com', 'portfoland.com')).toBe('john');
  });

  it('extracts "john" from "john.localhost:3000" with base "localhost" (strips port)', () => {
    expect(extractSubdomain('john.localhost:3000', 'localhost')).toBe('john');
  });

  it('extracts "www" from "www.portfoland.com" with base "portfoland.com" (reserved, handled downstream)', () => {
    expect(extractSubdomain('www.portfoland.com', 'portfoland.com')).toBe('www');
  });

  it('returns null for bare domain "portfoland.com" with base "portfoland.com" (no subdomain)', () => {
    expect(extractSubdomain('portfoland.com', 'portfoland.com')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// proxy() integration tests
// ---------------------------------------------------------------------------

describe('proxy subdomain routing', () => {
  beforeEach(() => {
    mockRewriteUrls.length = 0;
    mockRedirectUrls.length = 0;
    mockRewriteResponses.length = 0;
    mockNextCalled = false;
  });

  it('rewrites john.portfoland.com/ to /{locale}/john with x-subdomain header', () => {
    const request = createRequest(
      'https://john.portfoland.com/',
      'john.portfoland.com',
      { localeCookie: 'en' },
    );

    const response = proxy(request);

    expect(response._type).toBe('rewrite');
    expect(mockRewriteUrls).toHaveLength(1);
    expect(mockRewriteUrls[0].pathname).toBe('/en/john');
    expect(mockRewriteResponses[0]._headers.get('x-subdomain')).toBe('john');
  });

  it('rewrites john.portfoland.com/skills to /{locale}/john/skills', () => {
    const request = createRequest(
      'https://john.portfoland.com/skills',
      'john.portfoland.com',
      { localeCookie: 'es' },
    );

    const response = proxy(request);

    expect(response._type).toBe('rewrite');
    expect(mockRewriteUrls).toHaveLength(1);
    expect(mockRewriteUrls[0].pathname).toBe('/es/john/skills');
    expect(mockRewriteResponses[0]._headers.get('x-subdomain')).toBe('john');
  });

  it('passes through www.portfoland.com to normal routing (reserved subdomain)', () => {
    const request = createRequest(
      'https://www.portfoland.com/',
      'www.portfoland.com',
    );

    const response = proxy(request);

    // Reserved subdomains skip subdomain rewriting. Since the URL has no
    // locale prefix, the existing proxy logic redirects to add one.
    expect(mockRewriteUrls).toHaveLength(0);
    expect(response._type).toBe('redirect');
  });

  it('redirects john.portfoland.com/dashboard to root domain portfoland.com/{locale}/dashboard', () => {
    const request = createRequest(
      'https://john.portfoland.com/dashboard',
      'john.portfoland.com',
      { localeCookie: 'en' },
    );

    const response = proxy(request);

    expect(response._type).toBe('redirect');
    expect(mockRedirectUrls).toHaveLength(1);
    expect(mockRedirectUrls[0].hostname).toBe('portfoland.com');
    expect(mockRedirectUrls[0].pathname).toBe('/en/dashboard');
  });
});
