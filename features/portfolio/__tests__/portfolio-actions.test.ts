/**
 * Portfolio Server Action Tests
 *
 * Tests for the togglePortfolioMode server action:
 * - Successfully updates mode from professional to gaming
 * - Rejects invalid mode values
 * - Requires authentication (returns error for unauthenticated request)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';

const mockUser = {
  id: mockUserId,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: null,
  bio: 'A test bio',
  portfolioMode: 'professional',
};

// =============================================================================
// Tests
// =============================================================================

describe('togglePortfolioMode Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully updates mode from professional to gaming', async () => {
    const { togglePortfolioMode } = await import(
      '../actions/togglePortfolioMode'
    );

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: mockUserId, username: 'testuser' },
      session: { id: 'session-1' },
    } as any);

    // Mock successful update
    const updatedUser = { ...mockUser, portfolioMode: 'gaming' };
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

    const result = await togglePortfolioMode({ mode: 'gaming' });

    expect(result.hasError).toBe(false);
    expect(result.message).toBe('Portfolio mode updated successfully');
    expect(result.payload.portfolioMode).toBe('gaming');
    expect(revalidatePath).toHaveBeenCalledWith('/en/testuser');
    expect(revalidatePath).toHaveBeenCalledWith('/es/testuser');
  });

  it('rejects invalid mode values', async () => {
    const { togglePortfolioMode } = await import(
      '../actions/togglePortfolioMode'
    );

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: mockUserId, username: 'testuser' },
      session: { id: 'session-1' },
    } as any);

    const result = await togglePortfolioMode({ mode: 'invalid-mode' });

    expect(result.hasError).toBe(true);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('requires authentication (returns error for unauthenticated request)', async () => {
    const { togglePortfolioMode } = await import(
      '../actions/togglePortfolioMode'
    );

    // Mock no session
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await togglePortfolioMode({ mode: 'gaming' });

    expect(result.hasError).toBe(true);
    expect(result.message).toBe('Please log in to continue');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
