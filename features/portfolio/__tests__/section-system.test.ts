/**
 * Section System Tests (Task Group 6.1)
 *
 * Tests for the section constants (TECH_DEFAULT_SECTIONS, CLASSIC_DEFAULT_SECTIONS)
 * and the Classic Mode content existence helpers (hasServicesData, hasGalleryItemsData,
 * hasTestimonialsData).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      count: vi.fn(),
    },
    galleryItem: {
      count: vi.fn(),
    },
    testimonial: {
      count: vi.fn(),
    },
  },
}));

// =============================================================================
// Imports (after mocks)
// =============================================================================

import { prisma } from '@/lib/prisma';
import {
  TECH_DEFAULT_SECTIONS,
  CLASSIC_DEFAULT_SECTIONS,
} from '../constants/sections';
import {
  hasServicesData,
  hasGalleryItemsData,
  hasTestimonialsData,
} from '../data/hasClassicContent.data';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';

// =============================================================================
// Section Constants Tests
// =============================================================================

describe('TECH_DEFAULT_SECTIONS', () => {
  it('contains the expected Tech Mode section keys', () => {
    expect(TECH_DEFAULT_SECTIONS).toContain('hero');
    expect(TECH_DEFAULT_SECTIONS).toContain('about');
    expect(TECH_DEFAULT_SECTIONS).toContain('timeline');
    expect(TECH_DEFAULT_SECTIONS).toContain('skills');
    expect(TECH_DEFAULT_SECTIONS).toContain('projects');
    expect(TECH_DEFAULT_SECTIONS).toContain('ai');
    expect(TECH_DEFAULT_SECTIONS).toContain('contact');
  });

  it('does not contain Classic Mode-only sections', () => {
    const techSections = TECH_DEFAULT_SECTIONS as readonly string[];
    expect(techSections).not.toContain('services');
    expect(techSections).not.toContain('testimonials');
    expect(techSections).not.toContain('gallery');
  });
});

describe('CLASSIC_DEFAULT_SECTIONS', () => {
  it('contains the expected Classic Mode section keys', () => {
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('hero');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('about');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('gallery');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('services');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('skills');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('testimonials');
    expect(CLASSIC_DEFAULT_SECTIONS).toContain('contact');
  });

  it('does not contain Tech Mode-only sections', () => {
    const classicSections = CLASSIC_DEFAULT_SECTIONS as readonly string[];
    expect(classicSections).not.toContain('ai');
    expect(classicSections).not.toContain('timeline');
    expect(classicSections).not.toContain('projects');
  });
});

// =============================================================================
// hasServicesData Tests
// =============================================================================

describe('hasServicesData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when at least one published service exists', async () => {
    vi.mocked(prisma.service.count).mockResolvedValue(3);

    const result = await hasServicesData(mockUserId);

    expect(prisma.service.count).toHaveBeenCalledWith({
      where: { userId: mockUserId, published: true },
    });
    expect(result).toBe(true);
  });

  it('returns false when no published services exist', async () => {
    vi.mocked(prisma.service.count).mockResolvedValue(0);

    const result = await hasServicesData(mockUserId);

    expect(result).toBe(false);
  });
});

// =============================================================================
// hasGalleryItemsData Tests
// =============================================================================

describe('hasGalleryItemsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when at least one published gallery item exists', async () => {
    vi.mocked(prisma.galleryItem.count).mockResolvedValue(5);

    const result = await hasGalleryItemsData(mockUserId);

    expect(prisma.galleryItem.count).toHaveBeenCalledWith({
      where: { userId: mockUserId, published: true },
    });
    expect(result).toBe(true);
  });

  it('returns false when no published gallery items exist', async () => {
    vi.mocked(prisma.galleryItem.count).mockResolvedValue(0);

    const result = await hasGalleryItemsData(mockUserId);

    expect(result).toBe(false);
  });
});

// =============================================================================
// hasTestimonialsData Tests
// =============================================================================

describe('hasTestimonialsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when at least one published testimonial exists', async () => {
    vi.mocked(prisma.testimonial.count).mockResolvedValue(2);

    const result = await hasTestimonialsData(mockUserId);

    expect(prisma.testimonial.count).toHaveBeenCalledWith({
      where: { userId: mockUserId, published: true },
    });
    expect(result).toBe(true);
  });

  it('returns false when no published testimonials exist', async () => {
    vi.mocked(prisma.testimonial.count).mockResolvedValue(0);

    const result = await hasTestimonialsData(mockUserId);

    expect(result).toBe(false);
  });
});
