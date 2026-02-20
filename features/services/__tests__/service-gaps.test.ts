/**
 * Services Feature — Gap-Filling Tests (Task Group 8.3)
 *
 * Strategic tests covering integration points and edge cases not addressed
 * in the primary service.test.ts file.
 *
 * Gaps covered:
 * 1. STARTING_FROM price type validation (priceMin required, priceMax not required)
 * 2. updateServiceService happy path (authorized owner successfully updates)
 * 3. invalidateNarrativeCache called after create and delete mutations
 * 4. createServiceAction -> service -> data end-to-end integration via action layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/cache', () => ({
  invalidateNarrativeCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// =============================================================================
// Imports (after mocks)
// =============================================================================

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { invalidateNarrativeCache } from '@/lib/ai/cache';

import {
  createServiceService,
  updateServiceService,
  deleteServiceService,
} from '../services/service.service';
import { createServiceSchema } from '../schemas/service.schema';
import { createServiceAction } from '../actions/serviceActions';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockServiceId = 'clsvc123456789';

const mockService = {
  id: mockServiceId,
  userId: mockUserId,
  title: 'Headshot Session',
  description: 'Professional headshots for LinkedIn or corporate profiles.',
  priceType: 'STARTING_FROM' as const,
  priceMin: 80,
  priceMax: null,
  currency: 'USD',
  durationMinutes: 45,
  order: 0,
  published: true,
  imageUrl: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

// =============================================================================
// Gap 1: STARTING_FROM price type validation
// =============================================================================

describe('createServiceSchema — STARTING_FROM price type', () => {
  it('accepts STARTING_FROM with priceMin provided (no priceMax required)', async () => {
    const result = await createServiceSchema.validate({
      title: 'Headshot Session',
      description: 'Professional headshots for LinkedIn or corporate profiles.',
      priceType: 'STARTING_FROM',
      priceMin: 80,
      currency: 'USD',
    });

    expect(result.priceType).toBe('STARTING_FROM');
    expect(result.priceMin).toBe(80);
    expect(result.priceMax).toBeUndefined();
  });

  it('rejects STARTING_FROM when priceMin is missing', async () => {
    await expect(
      createServiceSchema.validate({
        title: 'Headshot Session',
        description: 'Professional headshots for LinkedIn or corporate profiles.',
        priceType: 'STARTING_FROM',
        currency: 'USD',
      })
    ).rejects.toThrow();
  });
});

// =============================================================================
// Gap 2: updateServiceService happy path (authorized owner)
// =============================================================================

describe('updateServiceService — happy path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates and returns the service when the owner makes the request', async () => {
    const updatedService = { ...mockService, title: 'Premium Headshot Session', priceMin: 120 };

    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService);
    vi.mocked(prisma.service.update).mockResolvedValue(updatedService);

    const result = await updateServiceService({
      id: mockServiceId,
      userId: mockUserId,
      title: 'Premium Headshot Session',
      priceMin: 120,
    });

    expect(prisma.service.update).toHaveBeenCalledOnce();
    expect(result.title).toBe('Premium Headshot Session');
    expect(result.priceMin).toBe(120);
    expect(result.id).toBe(mockServiceId);
  });
});

// =============================================================================
// Gap 3: invalidateNarrativeCache called after mutations
// =============================================================================

describe('invalidateNarrativeCache — called after service mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls invalidateNarrativeCache after createServiceService', async () => {
    vi.mocked(prisma.service.count).mockResolvedValue(0);
    vi.mocked(prisma.service.create).mockResolvedValue(mockService);

    await createServiceService({
      userId: mockUserId,
      title: 'Headshot Session',
      description: 'Professional headshots for LinkedIn or corporate profiles.',
      priceType: 'STARTING_FROM',
      priceMin: 80,
      currency: 'USD',
    });

    expect(invalidateNarrativeCache).toHaveBeenCalledWith(mockUserId);
  });

  it('calls invalidateNarrativeCache after deleteServiceService', async () => {
    vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService);
    vi.mocked(prisma.service.delete).mockResolvedValue(mockService);

    await deleteServiceService(mockServiceId, mockUserId);

    expect(invalidateNarrativeCache).toHaveBeenCalledWith(mockUserId);
  });
});

// =============================================================================
// Gap 4: createServiceAction -> service -> data end-to-end via action layer
//
// ActionResponse shape: { hasError: boolean, message: string, payload: T | null }
// =============================================================================

describe('createServiceAction — end-to-end action -> service -> data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns hasError: false and payload when session is valid and data is correct', async () => {
    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: mockUserId, name: 'Jane Doe', email: 'jane@example.com' },
      session: { id: 'session-123' },
    } as any);

    // Mock data layer responses
    vi.mocked(prisma.service.count).mockResolvedValue(0);
    vi.mocked(prisma.service.create).mockResolvedValue(mockService);

    const result = await createServiceAction({
      title: 'Headshot Session',
      description: 'Professional headshots for LinkedIn or corporate profiles.',
      priceType: 'STARTING_FROM',
      priceMin: 80,
      currency: 'USD',
    });

    expect(result.hasError).toBe(false);
    expect(result.payload).toBeDefined();
    expect(result.payload!.title).toBe('Headshot Session');
  });

  it('returns hasError: true when session is missing (unauthenticated)', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const result = await createServiceAction({
      title: 'Headshot Session',
      description: 'Professional headshots for LinkedIn or corporate profiles.',
      priceType: 'FIXED',
      priceMin: 100,
      currency: 'USD',
    });

    expect(result.hasError).toBe(true);
    // payload is null (not undefined) for error responses per ActionResponse<T>
    expect(result.payload).toBeNull();
  });
});
