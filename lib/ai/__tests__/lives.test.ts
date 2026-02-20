import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAndConsumeLives } from '../lives';

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $runCommandRaw: vi.fn(),
  },
}));

import { prisma } from '@/lib/prisma';

const mockRunCommandRaw = vi.mocked(prisma.$runCommandRaw);

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 864e5).toISOString().split('T')[0];
const USER_ID = 'test-user-cuid-123';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkAndConsumeLives', () => {
  it('returns { hasLives: true, remainingLives: 2 } when user has 3 lives', async () => {
    // Step 1 (reset): no match — already today
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });
    // Step 2 (decrement): match — decremented from 3 to 2
    mockRunCommandRaw.mockResolvedValueOnce({
      value: { _id: USER_ID, meta: { remainingLives: 2, lastResetDate: TODAY } },
      ok: 1,
    });

    const result = await checkAndConsumeLives(USER_ID);

    expect(result).toEqual({ hasLives: true, remainingLives: 2 });
    expect(mockRunCommandRaw).toHaveBeenCalledTimes(2);
  });

  it('returns { hasLives: false, remainingLives: 0 } when lives are already 0', async () => {
    // Step 1 (reset): no match — already today
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });
    // Step 2 (decrement): no match — 0 lives remaining
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });

    const result = await checkAndConsumeLives(USER_ID);

    expect(result.hasLives).toBe(false);
    expect(result.remainingLives).toBe(0);
    expect(result.error).toBeDefined();
  });

  it('resets lives when lastResetDate is yesterday, then decrements', async () => {
    // Step 1 (reset): match — yesterday != today, reset fires
    mockRunCommandRaw.mockResolvedValueOnce({
      value: { _id: USER_ID, meta: { remainingLives: 0, lastResetDate: YESTERDAY } },
      ok: 1,
    });
    // Step 2 (decrement): match — now has 3 lives after reset, decrements to 2
    mockRunCommandRaw.mockResolvedValueOnce({
      value: { _id: USER_ID, meta: { remainingLives: 2, lastResetDate: TODAY } },
      ok: 1,
    });

    const result = await checkAndConsumeLives(USER_ID);

    expect(result).toEqual({ hasLives: true, remainingLives: 2 });
    // Verify Step 1 included the reset update
    expect(mockRunCommandRaw).toHaveBeenNthCalledWith(1, expect.objectContaining({
      update: { $set: { 'meta.remainingLives': 3, 'meta.lastResetDate': TODAY } },
    }));
  });

  it('returns English error message when locale is "en" and lives are 0', async () => {
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });

    const result = await checkAndConsumeLives(USER_ID, 'en');

    expect(result.hasLives).toBe(false);
    expect(result.error).toContain('Come back tomorrow');
    expect(result.error).not.toContain('mañana');
  });

  it('returns Spanish error message when locale is "es" and lives are 0', async () => {
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });
    mockRunCommandRaw.mockResolvedValueOnce({ value: null, ok: 1 });

    const result = await checkAndConsumeLives(USER_ID, 'es');

    expect(result.hasLives).toBe(false);
    expect(result.error).toContain('mañana');
    expect(result.error).not.toContain('Come back tomorrow');
  });
});
