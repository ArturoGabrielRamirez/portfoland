/**
 * Gallery Feature Tests
 *
 * Tests for the service layer business logic, data layer, schema validation,
 * and public query behaviour for the Gallery feature.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    galleryItem: {
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
  createGalleryItemService,
  updateGalleryItemService,
  deleteGalleryItemService,
} from '../services/galleryItem.service';
import { createGalleryItemSchema } from '../schemas/galleryItem.schema';
import { getPublicGalleryData } from '../data/getPublicGallery.data';
import { GALLERY_MESSAGES } from '../constants/messages';
import { MAX_GALLERY_ITEMS_PER_USER } from '../constants/limits';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockOtherUserId = 'cluser987654321';
const mockItemId = 'clgal123456789';

const mockGalleryItem = {
  id: mockItemId,
  userId: mockUserId,
  imageUrl: 'https://example.com/photo.jpg',
  caption: 'A beautiful landscape',
  altText: 'Landscape photo',
  category: 'Nature',
  order: 0,
  published: true,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

// =============================================================================
// Task 4.1a: Create gallery item with valid data (imageUrl required)
// =============================================================================

describe('Gallery Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createGalleryItemService — valid data', () => {
    it('creates a gallery item and returns it when data is valid', async () => {
      vi.mocked(prisma.galleryItem.count).mockResolvedValue(0);
      vi.mocked(prisma.galleryItem.create).mockResolvedValue(mockGalleryItem);

      const result = await createGalleryItemService({
        userId: mockUserId,
        imageUrl: 'https://example.com/photo.jpg',
        caption: 'A beautiful landscape',
        altText: 'Landscape photo',
        category: 'Nature',
        order: 0,
        published: true,
      });

      expect(prisma.galleryItem.create).toHaveBeenCalledOnce();
      expect(result.imageUrl).toBe('https://example.com/photo.jpg');
      expect(result.userId).toBe(mockUserId);
    });
  });

  // ===========================================================================
  // Task 4.1c: Update gallery item with ownership check
  // ===========================================================================

  describe('updateGalleryItemService — ownership check', () => {
    it('throws UNAUTHORIZED when userId does not match gallery item owner', async () => {
      vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(mockGalleryItem);

      await expect(
        updateGalleryItemService({
          id: mockItemId,
          userId: mockOtherUserId,
          caption: 'Updated caption',
        })
      ).rejects.toThrow(GALLERY_MESSAGES.UNAUTHORIZED);
    });

    it('throws NOT_FOUND when gallery item does not exist', async () => {
      vi.mocked(prisma.galleryItem.findUnique).mockResolvedValue(null);

      await expect(
        updateGalleryItemService({
          id: 'non-existent-id',
          userId: mockUserId,
          caption: 'Updated caption',
        })
      ).rejects.toThrow(GALLERY_MESSAGES.NOT_FOUND);
    });
  });

  // ===========================================================================
  // MAX_GALLERY_ITEMS_PER_USER limit enforcement
  // ===========================================================================

  describe('createGalleryItemService — MAX_GALLERY_ITEMS_PER_USER limit', () => {
    it('throws when user has reached MAX_GALLERY_ITEMS_PER_USER', async () => {
      vi.mocked(prisma.galleryItem.count).mockResolvedValue(MAX_GALLERY_ITEMS_PER_USER);

      await expect(
        createGalleryItemService({
          userId: mockUserId,
          imageUrl: 'https://example.com/another.jpg',
          order: 0,
          published: true,
        })
      ).rejects.toThrow(`You have reached the maximum of ${MAX_GALLERY_ITEMS_PER_USER} gallery items`);
    });
  });
});

// =============================================================================
// Task 4.1b: Create gallery item fails without imageUrl
// =============================================================================

describe('createGalleryItemSchema — imageUrl required', () => {
  it('accepts valid data when imageUrl is provided', async () => {
    const result = await createGalleryItemSchema.validate({
      imageUrl: 'https://example.com/photo.jpg',
      caption: 'A landscape',
      category: 'Nature',
      order: 0,
    });

    expect(result.imageUrl).toBe('https://example.com/photo.jpg');
  });

  it('rejects when imageUrl is missing', async () => {
    await expect(
      createGalleryItemSchema.validate({
        caption: 'A landscape',
        category: 'Nature',
      })
    ).rejects.toThrow();
  });

  it('rejects when imageUrl is not a valid URL', async () => {
    await expect(
      createGalleryItemSchema.validate({
        imageUrl: 'not-a-valid-url',
        caption: 'A landscape',
      })
    ).rejects.toThrow();
  });
});

// =============================================================================
// Task 4.1d: getPublicGallery returns only published items ordered by order
// Task 4.1e: getPublicGallery returns distinct categories list
// =============================================================================

describe('getPublicGalleryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only published items ordered by order asc and returns items with categories', async () => {
    const item1 = { ...mockGalleryItem, id: 'gal-1', order: 0, category: 'Nature' };
    const item2 = { ...mockGalleryItem, id: 'gal-2', order: 1, category: 'Architecture' };

    vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([item1, item2]);

    const result = await getPublicGalleryData(mockUserId);

    expect(prisma.galleryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: mockUserId, published: true },
        orderBy: [{ order: 'asc' }],
      })
    );
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('gal-1');
  });

  it('returns distinct non-null categories from published items', async () => {
    const item1 = { ...mockGalleryItem, id: 'gal-1', category: 'Nature' };
    const item2 = { ...mockGalleryItem, id: 'gal-2', category: 'Architecture' };
    const item3 = { ...mockGalleryItem, id: 'gal-3', category: 'Nature' };
    const item4 = { ...mockGalleryItem, id: 'gal-4', category: null };

    vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([item1, item2, item3, item4]);

    const result = await getPublicGalleryData(mockUserId);

    expect(result.categories).toHaveLength(2);
    expect(result.categories).toContain('Nature');
    expect(result.categories).toContain('Architecture');
    expect(result.categories).not.toContain(null);
  });

  it('returns empty items and categories when no published gallery items exist', async () => {
    vi.mocked(prisma.galleryItem.findMany).mockResolvedValue([]);

    const result = await getPublicGalleryData(mockUserId);

    expect(result.items).toEqual([]);
    expect(result.categories).toEqual([]);
  });
});
