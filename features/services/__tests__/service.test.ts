/**
 * Services Feature Tests
 *
 * Tests for the service layer business logic, data layer, schema validation,
 * and public query behaviour for the Services feature.
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

import {
  createServiceService,
  updateServiceService,
  deleteServiceService,
} from '../services/service.service';
import { createServiceSchema } from '../schemas/service.schema';
import { getPublicServicesData } from '../data/getPublicServices.data';
import { SERVICE_MESSAGES } from '../constants/messages';
import { MAX_SERVICES_PER_USER } from '../constants/limits';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockOtherUserId = 'cluser987654321';
const mockServiceId = 'clsvc123456789';

const mockService = {
  id: mockServiceId,
  userId: mockUserId,
  title: 'Portrait Session',
  description: 'A professional portrait photography session in studio.',
  priceType: 'FIXED' as const,
  priceMin: 150,
  priceMax: null,
  currency: 'USD',
  durationMinutes: 60,
  order: 0,
  published: true,
  imageUrl: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

// =============================================================================
// Task 2.1a: Create service with valid data
// =============================================================================

describe('Service Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createServiceService — valid data', () => {
    it('creates a service and returns it when data is valid', async () => {
      vi.mocked(prisma.service.count).mockResolvedValue(0);
      vi.mocked(prisma.service.create).mockResolvedValue(mockService);

      const result = await createServiceService({
        userId: mockUserId,
        title: 'Portrait Session',
        description: 'A professional portrait photography session in studio.',
        priceType: 'FIXED',
        priceMin: 150,
        currency: 'USD',
        order: 0,
        published: true,
      });

      expect(prisma.service.create).toHaveBeenCalledOnce();
      expect(result.title).toBe('Portrait Session');
      expect(result.userId).toBe(mockUserId);
    });
  });

  // ===========================================================================
  // Task 2.1f: MAX_SERVICES_PER_USER limit enforcement
  // ===========================================================================

  describe('createServiceService — MAX_SERVICES_PER_USER limit', () => {
    it('throws when user has reached MAX_SERVICES_PER_USER', async () => {
      vi.mocked(prisma.service.count).mockResolvedValue(MAX_SERVICES_PER_USER);

      await expect(
        createServiceService({
          userId: mockUserId,
          title: 'Another Service',
          description: 'This should be rejected by the limit check.',
          priceType: 'CONTACT',
          currency: 'USD',
          order: 0,
          published: true,
        })
      ).rejects.toThrow(`You have reached the maximum of ${MAX_SERVICES_PER_USER} services`);
    });
  });

  // ===========================================================================
  // Task 2.1c: Update service with ownership check
  // ===========================================================================

  describe('updateServiceService — ownership check', () => {
    it('throws UNAUTHORIZED when userId does not match service owner', async () => {
      vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService);

      await expect(
        updateServiceService({
          id: mockServiceId,
          userId: mockOtherUserId,
          title: 'Updated Title',
        })
      ).rejects.toThrow(SERVICE_MESSAGES.UNAUTHORIZED);
    });

    it('throws NOT_FOUND when service does not exist', async () => {
      vi.mocked(prisma.service.findUnique).mockResolvedValue(null);

      await expect(
        updateServiceService({
          id: 'non-existent-id',
          userId: mockUserId,
          title: 'Updated Title',
        })
      ).rejects.toThrow(SERVICE_MESSAGES.NOT_FOUND);
    });
  });

  // ===========================================================================
  // Task 2.1d: Delete service with ownership check
  // ===========================================================================

  describe('deleteServiceService — ownership check', () => {
    it('throws UNAUTHORIZED when userId does not match service owner', async () => {
      vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService);

      await expect(
        deleteServiceService(mockServiceId, mockOtherUserId)
      ).rejects.toThrow(SERVICE_MESSAGES.UNAUTHORIZED);
    });

    it('throws NOT_FOUND when service does not exist', async () => {
      vi.mocked(prisma.service.findUnique).mockResolvedValue(null);

      await expect(
        deleteServiceService('non-existent-id', mockUserId)
      ).rejects.toThrow(SERVICE_MESSAGES.NOT_FOUND);
    });

    it('deletes and returns the service when authorised', async () => {
      vi.mocked(prisma.service.findUnique).mockResolvedValue(mockService);
      vi.mocked(prisma.service.delete).mockResolvedValue(mockService);

      const result = await deleteServiceService(mockServiceId, mockUserId);

      expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: mockServiceId } });
      expect(result.id).toBe(mockServiceId);
    });
  });
});

// =============================================================================
// Task 2.1b: Conditional price validation — RANGE requires priceMax > priceMin
// =============================================================================

describe('createServiceSchema — conditional price validation', () => {
  it('accepts FIXED price type with only priceMin provided', async () => {
    const result = await createServiceSchema.validate({
      title: 'Haircut',
      description: 'A standard haircut service for all hair types.',
      priceType: 'FIXED',
      priceMin: 25,
      currency: 'USD',
    });

    expect(result.priceType).toBe('FIXED');
    expect(result.priceMin).toBe(25);
  });

  it('accepts CONTACT price type without priceMin or priceMax', async () => {
    const result = await createServiceSchema.validate({
      title: 'Custom Commission',
      description: 'A bespoke service, price agreed on enquiry.',
      priceType: 'CONTACT',
      currency: 'USD',
    });

    expect(result.priceType).toBe('CONTACT');
    expect(result.priceMin).toBeUndefined();
  });

  it('rejects RANGE price type when priceMax is not greater than priceMin', async () => {
    await expect(
      createServiceSchema.validate({
        title: 'Photo Package',
        description: 'A photography package with a price range.',
        priceType: 'RANGE',
        priceMin: 200,
        priceMax: 100,
        currency: 'USD',
      })
    ).rejects.toThrow();
  });

  it('accepts RANGE price type when priceMax is greater than priceMin', async () => {
    const result = await createServiceSchema.validate({
      title: 'Photo Package',
      description: 'A photography package with a price range.',
      priceType: 'RANGE',
      priceMin: 100,
      priceMax: 300,
      currency: 'USD',
    });

    expect(result.priceMax).toBe(300);
    expect(result.priceMin).toBe(100);
  });

  it('rejects FIXED price type when priceMin is missing', async () => {
    await expect(
      createServiceSchema.validate({
        title: 'Haircut',
        description: 'A standard haircut service for all hair types.',
        priceType: 'FIXED',
        currency: 'USD',
      })
    ).rejects.toThrow();
  });
});

// =============================================================================
// Task 2.1e: getPublicServices returns only published items ordered by order
// =============================================================================

describe('getPublicServicesData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only published services ordered by order asc', async () => {
    const publishedService1 = { ...mockService, id: 'svc-1', order: 1 };
    const publishedService2 = { ...mockService, id: 'svc-2', order: 2 };

    vi.mocked(prisma.service.findMany).mockResolvedValue([
      publishedService1,
      publishedService2,
    ]);

    const result = await getPublicServicesData(mockUserId);

    expect(prisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUserId, published: true },
        orderBy: [{ order: 'asc' }],
      })
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('svc-1');
  });

  it('returns empty array when no published services exist', async () => {
    vi.mocked(prisma.service.findMany).mockResolvedValue([]);

    const result = await getPublicServicesData(mockUserId);

    expect(result).toEqual([]);
  });
});
