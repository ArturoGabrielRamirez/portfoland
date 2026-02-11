/**
 * Project Data Layer Tests
 *
 * Tests for the pure Prisma data layer functions.
 * Covers: createProjectData, getProjectsByUserIdData, getProjectByIdData.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Import after mock
import { prisma } from '@/lib/prisma';

// Import data functions
import {
  createProjectData,
  getProjectsByUserIdData,
  getProjectByIdData,
} from '../data';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockProjectId = 'clproj123456789';

const mockProject = {
  id: mockProjectId,
  userId: mockUserId,
  title: 'My Portfolio App',
  slug: 'my-portfolio-app',
  description: 'A full-stack portfolio application built with Next.js',
  shortDescription: 'Portfolio app',
  imageUrl: 'https://example.com/image.png',
  technologies: ['TypeScript', 'React', 'Next.js'],
  links: [{ type: 'LIVE', label: 'Live Site', url: 'https://example.com' }],
  featured: false,
  status: 'IN_PROGRESS' as const,
  startDate: new Date('2024-01-15'),
  endDate: null,
  order: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

// =============================================================================
// Tests
// =============================================================================

describe('Project Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProjectData', () => {
    it('creates a project and returns it with all fields', async () => {
      vi.mocked(prisma.project.create).mockResolvedValue(mockProject);

      const input = {
        userId: mockUserId,
        title: 'My Portfolio App',
        slug: 'my-portfolio-app',
        description: 'A full-stack portfolio application built with Next.js',
        shortDescription: 'Portfolio app',
        imageUrl: 'https://example.com/image.png',
        technologies: ['TypeScript', 'React', 'Next.js'],
        links: [{ type: 'LIVE', label: 'Live Site', url: 'https://example.com' }],
        featured: false,
        startDate: new Date('2024-01-15'),
      };

      const result = await createProjectData(input);

      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            title: 'My Portfolio App',
            slug: 'my-portfolio-app',
            description: 'A full-stack portfolio application built with Next.js',
            technologies: ['TypeScript', 'React', 'Next.js'],
          }),
        })
      );

      expect(result.id).toBe(mockProjectId);
      expect(result.title).toBe('My Portfolio App');
      expect(result.slug).toBe('my-portfolio-app');
      expect(result.technologies).toEqual(['TypeScript', 'React', 'Next.js']);
      expect(result.links).toEqual([{ type: 'LIVE', label: 'Live Site', url: 'https://example.com' }]);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('getProjectsByUserIdData', () => {
    it('returns projects ordered by order then createdAt desc', async () => {
      const projectWithOrder = { ...mockProject, id: 'clproj-1', order: 1, createdAt: new Date('2024-02-01') };
      const projectNoOrder = { ...mockProject, id: 'clproj-2', order: null, createdAt: new Date('2024-03-01') };
      const mockProjects = [projectWithOrder, projectNoOrder];

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects);

      const result = await getProjectsByUserIdData(mockUserId);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          orderBy: [
            { order: { sort: 'asc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
        })
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('clproj-1');
      expect(result[1].id).toBe('clproj-2');
    });
  });

  describe('getProjectByIdData', () => {
    it('returns null for non-existent ID', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await getProjectByIdData('non-existent-id');

      expect(prisma.project.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'non-existent-id' },
        })
      );
      expect(result).toBeNull();
    });
  });
});
