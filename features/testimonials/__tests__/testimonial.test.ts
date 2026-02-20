/**
 * Testimonials Feature Tests
 *
 * Tests for the service layer business logic, data layer, schema validation,
 * and public query behaviour for the Testimonials feature.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    testimonial: {
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

import {
  createTestimonialService,
  updateTestimonialService,
  deleteTestimonialService,
} from '../services/testimonial.service';
import { createTestimonialSchema } from '../schemas/testimonial.schema';
import { getPublicTestimonialsData } from '../data/getPublicTestimonials.data';
import { TESTIMONIAL_MESSAGES } from '../constants/messages';
import { MAX_TESTIMONIALS_PER_USER } from '../constants/limits';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockOtherUserId = 'cluser987654321';
const mockTestimonialId = 'cltmn123456789';

const mockTestimonial = {
  id: mockTestimonialId,
  userId: mockUserId,
  clientName: 'Jane Smith',
  clientTitle: 'CEO, Acme Corp',
  content: 'Excellent work! Delivered the project on time and exceeded all expectations.',
  rating: 5,
  imageUrl: null,
  source: 'manual',
  externalId: null,
  order: 0,
  published: true,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

// =============================================================================
// Task 3.1a: Create testimonial with valid data (including rating 1-5)
// =============================================================================

describe('Testimonial Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTestimonialService — valid data', () => {
    it('creates a testimonial and returns it when data is valid', async () => {
      vi.mocked(prisma.testimonial.count).mockResolvedValue(0);
      vi.mocked(prisma.testimonial.create).mockResolvedValue(mockTestimonial);

      const result = await createTestimonialService({
        userId: mockUserId,
        clientName: 'Jane Smith',
        content: 'Excellent work! Delivered the project on time and exceeded all expectations.',
        rating: 5,
        order: 0,
        published: true,
      });

      expect(prisma.testimonial.create).toHaveBeenCalledOnce();
      expect(result.clientName).toBe('Jane Smith');
      expect(result.userId).toBe(mockUserId);
      expect(result.rating).toBe(5);
    });
  });

  // ===========================================================================
  // MAX_TESTIMONIALS_PER_USER limit enforcement
  // ===========================================================================

  describe('createTestimonialService — MAX_TESTIMONIALS_PER_USER limit', () => {
    it('throws when user has reached MAX_TESTIMONIALS_PER_USER', async () => {
      vi.mocked(prisma.testimonial.count).mockResolvedValue(MAX_TESTIMONIALS_PER_USER);

      await expect(
        createTestimonialService({
          userId: mockUserId,
          clientName: 'Another Client',
          content: 'This testimonial should be rejected by the limit check.',
          rating: 4,
          order: 0,
          published: true,
        })
      ).rejects.toThrow(`You have reached the maximum of ${MAX_TESTIMONIALS_PER_USER} testimonials`);
    });
  });

  // ===========================================================================
  // Task 3.1c: Update testimonial with ownership check
  // ===========================================================================

  describe('updateTestimonialService — ownership check', () => {
    it('throws UNAUTHORIZED when userId does not match testimonial owner', async () => {
      vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(mockTestimonial);

      await expect(
        updateTestimonialService({
          id: mockTestimonialId,
          userId: mockOtherUserId,
          clientName: 'Updated Name',
        })
      ).rejects.toThrow(TESTIMONIAL_MESSAGES.UNAUTHORIZED);
    });

    it('throws NOT_FOUND when testimonial does not exist', async () => {
      vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(null);

      await expect(
        updateTestimonialService({
          id: 'non-existent-id',
          userId: mockUserId,
          clientName: 'Updated Name',
        })
      ).rejects.toThrow(TESTIMONIAL_MESSAGES.NOT_FOUND);
    });
  });

  // ===========================================================================
  // Task 3.1d: Delete testimonial with ownership check
  // ===========================================================================

  describe('deleteTestimonialService — ownership check', () => {
    it('throws UNAUTHORIZED when userId does not match testimonial owner', async () => {
      vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(mockTestimonial);

      await expect(
        deleteTestimonialService(mockTestimonialId, mockOtherUserId)
      ).rejects.toThrow(TESTIMONIAL_MESSAGES.UNAUTHORIZED);
    });

    it('throws NOT_FOUND when testimonial does not exist', async () => {
      vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(null);

      await expect(
        deleteTestimonialService('non-existent-id', mockUserId)
      ).rejects.toThrow(TESTIMONIAL_MESSAGES.NOT_FOUND);
    });

    it('deletes and returns the testimonial when authorised', async () => {
      vi.mocked(prisma.testimonial.findUnique).mockResolvedValue(mockTestimonial);
      vi.mocked(prisma.testimonial.delete).mockResolvedValue(mockTestimonial);

      const result = await deleteTestimonialService(mockTestimonialId, mockUserId);

      expect(prisma.testimonial.delete).toHaveBeenCalledWith({ where: { id: mockTestimonialId } });
      expect(result.id).toBe(mockTestimonialId);
    });
  });
});

// =============================================================================
// Task 3.1b: Create testimonial fails with rating outside 1-5 range
// =============================================================================

describe('createTestimonialSchema — rating validation', () => {
  it('accepts valid rating of 1 (minimum)', async () => {
    const result = await createTestimonialSchema.validate({
      clientName: 'John Doe',
      content: 'Good work overall.',
      rating: 1,
    });

    expect(result.rating).toBe(1);
  });

  it('accepts valid rating of 5 (maximum)', async () => {
    const result = await createTestimonialSchema.validate({
      clientName: 'Jane Doe',
      content: 'Outstanding service, highly recommended!',
      rating: 5,
    });

    expect(result.rating).toBe(5);
  });

  it('rejects rating of 0 (below minimum)', async () => {
    await expect(
      createTestimonialSchema.validate({
        clientName: 'Bad Actor',
        content: 'This rating is invalid.',
        rating: 0,
      })
    ).rejects.toThrow();
  });

  it('rejects rating of 6 (above maximum)', async () => {
    await expect(
      createTestimonialSchema.validate({
        clientName: 'Bad Actor',
        content: 'This rating is also invalid.',
        rating: 6,
      })
    ).rejects.toThrow();
  });

  it('rejects non-integer rating', async () => {
    await expect(
      createTestimonialSchema.validate({
        clientName: 'Bad Actor',
        content: 'Fractional ratings should not be allowed.',
        rating: 4.5,
      })
    ).rejects.toThrow();
  });

  it('rejects missing required clientName', async () => {
    await expect(
      createTestimonialSchema.validate({
        content: 'Great work!',
        rating: 5,
      })
    ).rejects.toThrow();
  });

  it('rejects missing required content', async () => {
    await expect(
      createTestimonialSchema.validate({
        clientName: 'Jane Doe',
        rating: 5,
      })
    ).rejects.toThrow();
  });

  it('accepts optional source as valid value', async () => {
    const result = await createTestimonialSchema.validate({
      clientName: 'Google Reviewer',
      content: 'Found this business on Google Maps.',
      rating: 4,
      source: 'google_maps',
    });

    expect(result.source).toBe('google_maps');
  });

  it('rejects invalid source value', async () => {
    await expect(
      createTestimonialSchema.validate({
        clientName: 'Bad Source',
        content: 'This source value is not allowed.',
        rating: 3,
        source: 'twitter',
      })
    ).rejects.toThrow();
  });
});

// =============================================================================
// Task 3.1e: getPublicTestimonials returns only published items ordered by order
// =============================================================================

describe('getPublicTestimonialsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only published testimonials ordered by order asc', async () => {
    const publishedTestimonial1 = { ...mockTestimonial, id: 'tmn-1', order: 1 };
    const publishedTestimonial2 = { ...mockTestimonial, id: 'tmn-2', order: 2 };

    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([
      publishedTestimonial1,
      publishedTestimonial2,
    ]);

    const result = await getPublicTestimonialsData(mockUserId);

    expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUserId, published: true },
        orderBy: [{ order: 'asc' }],
      })
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('tmn-1');
  });

  it('returns empty array when no published testimonials exist', async () => {
    vi.mocked(prisma.testimonial.findMany).mockResolvedValue([]);

    const result = await getPublicTestimonialsData(mockUserId);

    expect(result).toEqual([]);
  });
});
