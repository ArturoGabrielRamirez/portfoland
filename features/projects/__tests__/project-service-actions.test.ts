/**
 * Project Service and Action Layer Tests
 *
 * Tests for the service layer business logic and server actions.
 * Covers: slug auto-generation, ownership validation, not-found handling,
 * and action response format.
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

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  createProjectService,
  updateProjectService,
  deleteProjectService,
} from '../services/project.service';
import { createProject } from '../actions/createProject';
import { PROJECT_MESSAGES } from '../constants/messages';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockOtherUserId = 'cluser987654321';
const mockProjectId = 'clproj123456789';

const mockProject = {
  id: mockProjectId,
  userId: mockUserId,
  title: 'My Portfolio App',
  slug: 'my-portfolio-app',
  description: 'A full-stack portfolio application built with Next.js',
  shortDescription: 'Portfolio app',
  imageUrl: null,
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
// Service Layer Tests
// =============================================================================

describe('Project Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProjectService', () => {
    it('auto-generates slug from title when slug not provided', async () => {
      vi.mocked(prisma.project.create).mockResolvedValue(mockProject);

      await createProjectService({
        userId: mockUserId,
        title: 'My Portfolio App',
        description: 'A full-stack portfolio application built with Next.js',
        startDate: new Date('2024-01-15'),
      });

      expect(prisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'my-portfolio-app',
          }),
        })
      );
    });
  });

  describe('updateProjectService', () => {
    it('throws UNAUTHORIZED when userId does not match', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);

      await expect(
        updateProjectService({
          id: mockProjectId,
          userId: mockOtherUserId,
          title: 'Updated Title',
        })
      ).rejects.toThrow(PROJECT_MESSAGES.UNAUTHORIZED);
    });
  });

  describe('deleteProjectService', () => {
    it('throws NOT_FOUND for non-existent project', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      await expect(
        deleteProjectService('non-existent-id', mockUserId)
      ).rejects.toThrow(PROJECT_MESSAGES.NOT_FOUND);
    });
  });
});

// =============================================================================
// Action Layer Tests
// =============================================================================

describe('Project Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('returns ActionResponse with hasError false on success', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: mockUserId },
        session: {},
      } as any);

      vi.mocked(prisma.project.create).mockResolvedValue(mockProject);

      const result = await createProject({
        title: 'My Portfolio App',
        description: 'A full-stack portfolio application built with Next.js',
        startDate: new Date('2024-01-15'),
      });

      expect(result.hasError).toBe(false);
      expect(result.message).toBe(PROJECT_MESSAGES.CREATE_SUCCESS);
      expect(result.payload).toBeDefined();
      expect(result.payload.title).toBe('My Portfolio App');
    });
  });
});
