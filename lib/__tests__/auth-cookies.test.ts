/**
 * Auth Cookie Domain Configuration Tests
 *
 * Tests for Better Auth cross-subdomain cookie configuration:
 * - Production: crossSubDomainCookies enabled with domain `.portfoland.com`
 * - Development: crossSubDomainCookies not enabled (localhost default)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

let capturedOptions: Record<string, unknown> = {};

vi.mock('better-auth', () => ({
  betterAuth: (options: Record<string, unknown>) => {
    capturedOptions = options;
    return options;
  },
}));

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: vi.fn(() => 'mocked-adapter'),
}));

vi.mock('../prisma', () => ({
  prisma: 'mocked-prisma',
}));

// =============================================================================
// Tests
// =============================================================================

describe('Auth Cookie Domain Configuration', () => {
  beforeEach(() => {
    capturedOptions = {};
    vi.resetModules();
  });

  it('enables crossSubDomainCookies with .portfoland.com domain in production', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', 'portfoland.com');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');

    await import('../auth');

    const advanced = capturedOptions.advanced as Record<string, unknown>;
    const crossSubDomainCookies = advanced?.crossSubDomainCookies as Record<
      string,
      unknown
    >;

    expect(crossSubDomainCookies).toBeDefined();
    expect(crossSubDomainCookies.enabled).toBe(true);
    expect(crossSubDomainCookies.domain).toBe('.portfoland.com');

    vi.unstubAllEnvs();
  });

  it('does not enable crossSubDomainCookies in development (localhost)', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_DOMAIN', 'localhost');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');

    await import('../auth');

    const advanced = capturedOptions.advanced as
      | Record<string, unknown>
      | undefined;
    const crossSubDomainCookies = advanced?.crossSubDomainCookies as
      | Record<string, unknown>
      | undefined;

    expect(crossSubDomainCookies).toBeUndefined();

    vi.unstubAllEnvs();
  });
});
