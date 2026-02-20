/**
 * Portfolio Aggregation Tests (Task Group 7)
 *
 * Tests for the extended getPortfolioByUsername function and the four
 * byUsername wrapper functions introduced in TG7.
 *
 * These tests verify:
 * - getPortfolioByUsername returns services, testimonials, gallery, and settings
 * - Empty Classic Mode content returns empty arrays, not null
 * - byUsername wrappers resolve username to userId correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/features/timeline/data/getPublicTimeline.data', () => ({
  getPublicTimelineByUsername: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/features/skills/data/getPublicSkills.data', () => ({
  getPublicSkillsByUsername: vi.fn().mockResolvedValue(null),
}));

vi.mock('./getPublicProjects.data', () => ({
  getPublicProjectsByUsername: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/features/services/data', () => ({
  getPublicServicesData: vi.fn(),
}));

vi.mock('@/features/testimonials/data', () => ({
  getPublicTestimonialsData: vi.fn(),
}));

vi.mock('@/features/gallery/data', () => ({
  getPublicGalleryData: vi.fn(),
}));

vi.mock('@/features/portfolio-settings/data', () => ({
  getPortfolioSettingsData: vi.fn(),
}));

// =============================================================================
// Imports (after mocks)
// =============================================================================

import { prisma } from '@/lib/prisma';
import { getPublicServicesData } from '@/features/services/data';
import { getPublicTestimonialsData } from '@/features/testimonials/data';
import { getPublicGalleryData } from '@/features/gallery/data';
import { getPortfolioSettingsData } from '@/features/portfolio-settings/data';

import { getPortfolioByUsername } from './getPortfolio.data';
import { getPublicServicesByUsername } from './getPublicServices.data';
import { getPublicTestimonialsByUsername } from './getPublicTestimonials.data';
import { getPublicGalleryByUsername } from './getPublicGallery.data';
import { getPortfolioSettingsByUsername } from './getPortfolioSettings.data';

// =============================================================================
// Test Data
// =============================================================================

const mockUser = {
  id: 'user-123',
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  image: 'https://example.com/jane.jpg',
  bio: 'Creative professional.',
  portfolioMode: 'classic',
  locale: 'en',
  sectionOrder: ['hero', 'about', 'services'],
  contactLinks: {},
  sectionVisibility: {},
};

const mockService = {
  id: 'svc-1',
  userId: 'user-123',
  title: 'Portrait Session',
  description: 'Studio portrait photography.',
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

const mockTestimonial = {
  id: 'tst-1',
  userId: 'user-123',
  clientName: 'Alice',
  clientTitle: 'CEO',
  content: 'Excellent work!',
  rating: 5,
  imageUrl: null,
  source: 'manual',
  externalId: null,
  order: 0,
  published: true,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

const mockGalleryItem = {
  id: 'gal-1',
  userId: 'user-123',
  imageUrl: 'https://example.com/photo.jpg',
  caption: 'Wedding shoot',
  altText: 'Bride and groom',
  category: 'weddings',
  order: 0,
  published: true,
  createdAt: new Date('2026-01-05'),
  updatedAt: new Date('2026-01-05'),
};

const mockSettings = {
  id: 'set-1',
  userId: 'user-123',
  theme: 'default',
  layoutVariant: 'bento',
  accentColor: null,
  fontFamily: null,
  heroStyle: 'standard',
  showBranding: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// =============================================================================
// Task 7.1a: getPortfolioByUsername returns Classic Mode fields
// =============================================================================

describe('getPortfolioByUsername — Classic Mode fields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns services, testimonials, gallery, and settings alongside existing fields', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    vi.mocked(getPublicServicesData).mockResolvedValue([mockService] as any);
    vi.mocked(getPublicTestimonialsData).mockResolvedValue([mockTestimonial] as any);
    vi.mocked(getPublicGalleryData).mockResolvedValue({
      items: [mockGalleryItem],
      categories: ['weddings'],
    } as any);
    vi.mocked(getPortfolioSettingsData).mockResolvedValue(mockSettings as any);

    const result = await getPortfolioByUsername('janedoe');

    expect(result).not.toBeNull();
    expect(result!.services).toHaveLength(1);
    expect(result!.services[0].title).toBe('Portrait Session');
    expect(result!.testimonials).toHaveLength(1);
    expect(result!.testimonials[0].clientName).toBe('Alice');
    expect(result!.gallery).toHaveLength(1);
    expect(result!.gallery[0].imageUrl).toBe('https://example.com/photo.jpg');
    expect(result!.settings).not.toBeNull();
    expect(result!.settings!.theme).toBe('default');
  });

  // ===========================================================================
  // Task 7.1b: Empty Classic Mode content returns empty arrays, not null
  // ===========================================================================

  it('returns empty arrays for services, testimonials, and gallery when no Classic Mode content exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    vi.mocked(getPublicServicesData).mockResolvedValue([]);
    vi.mocked(getPublicTestimonialsData).mockResolvedValue([]);
    vi.mocked(getPublicGalleryData).mockResolvedValue({ items: [], categories: [] } as any);
    vi.mocked(getPortfolioSettingsData).mockResolvedValue(mockSettings as any);

    const result = await getPortfolioByUsername('janedoe');

    expect(result).not.toBeNull();
    expect(result!.services).toEqual([]);
    expect(result!.testimonials).toEqual([]);
    expect(result!.gallery).toEqual([]);
    // settings may be non-null due to lazy creation via upsert
    expect(Array.isArray(result!.services)).toBe(true);
    expect(Array.isArray(result!.testimonials)).toBe(true);
    expect(Array.isArray(result!.gallery)).toBe(true);
  });
});

// =============================================================================
// Task 7.1c: byUsername wrapper functions resolve username to userId correctly
// =============================================================================

describe('getPublicServicesByUsername — username to userId resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves username to userId and delegates to getPublicServicesData', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
    vi.mocked(getPublicServicesData).mockResolvedValue([mockService] as any);

    const result = await getPublicServicesByUsername('janedoe');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'janedoe' },
      select: { id: true },
    });
    expect(getPublicServicesData).toHaveBeenCalledWith('user-123');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Portrait Session');
  });

  it('returns empty array when username does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await getPublicServicesByUsername('ghost');

    expect(result).toEqual([]);
    expect(getPublicServicesData).not.toHaveBeenCalled();
  });
});

describe('getPublicTestimonialsByUsername — username to userId resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves username to userId and delegates to getPublicTestimonialsData', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
    vi.mocked(getPublicTestimonialsData).mockResolvedValue([mockTestimonial] as any);

    const result = await getPublicTestimonialsByUsername('janedoe');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'janedoe' },
      select: { id: true },
    });
    expect(getPublicTestimonialsData).toHaveBeenCalledWith('user-123');
    expect(result).toHaveLength(1);
    expect(result[0].clientName).toBe('Alice');
  });

  it('returns empty array when username does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await getPublicTestimonialsByUsername('ghost');

    expect(result).toEqual([]);
    expect(getPublicTestimonialsData).not.toHaveBeenCalled();
  });
});

describe('getPublicGalleryByUsername — returns items array only', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves username and returns GalleryItemModel[] (not PublicGalleryData)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
    vi.mocked(getPublicGalleryData).mockResolvedValue({
      items: [mockGalleryItem],
      categories: ['weddings'],
    } as any);

    const result = await getPublicGalleryByUsername('janedoe');

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].imageUrl).toBe('https://example.com/photo.jpg');
  });

  it('returns empty array when username does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await getPublicGalleryByUsername('ghost');

    expect(result).toEqual([]);
    expect(getPublicGalleryData).not.toHaveBeenCalled();
  });
});

describe('getPortfolioSettingsByUsername — username to userId resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves username and returns portfolio settings', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-123' } as any);
    vi.mocked(getPortfolioSettingsData).mockResolvedValue(mockSettings as any);

    const result = await getPortfolioSettingsByUsername('janedoe');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { username: 'janedoe' },
      select: { id: true },
    });
    expect(getPortfolioSettingsData).toHaveBeenCalledWith('user-123');
    expect(result).not.toBeNull();
    expect(result!.theme).toBe('default');
  });

  it('returns null when username does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await getPortfolioSettingsByUsername('ghost');

    expect(result).toBeNull();
    expect(getPortfolioSettingsData).not.toHaveBeenCalled();
  });
});
