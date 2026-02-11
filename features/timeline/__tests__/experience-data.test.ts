/**
 * Experience Data Layer Tests
 *
 * TDD approach: These tests define the expected behavior of the data layer
 * functions that will be implemented in Task Group 2.
 *
 * Tests are focused on core data operations:
 * - getExperiencesByUserId returns sorted by date
 * - getExperienceById with valid/invalid ID
 * - createExperience creates with correct XP
 * - updateExperience updates fields correctly
 * - deleteExperience removes record
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    experience: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Import after mock
import { prisma } from '@/lib/prisma';

// Import data functions (will be implemented)
import {
  getExperiencesByUserId,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  getPublicTimelineByUsername,
} from '../data';

// Import constants for XP calculation
import { XP_VALUES } from '../constants/xp';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockExperienceId = 'clexp123456789';

const mockExperience = {
  id: mockExperienceId,
  userId: mockUserId,
  type: 'WORK' as const,
  title: 'Senior Developer',
  company: 'Tech Corp',
  latitude: -34.6037,
  longitude: -58.3816,
  address: 'Buenos Aires, Argentina',
  startDate: new Date('2023-01-01'),
  endDate: null,
  description: 'Full-stack development',
  skills: ['TypeScript', 'React', 'Node.js'],
  xp: 500,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockExperiences = [
  mockExperience,
  {
    ...mockExperience,
    id: 'clexp123456790',
    type: 'EDUCATION' as const,
    title: 'Computer Science Degree',
    company: 'University',
    startDate: new Date('2018-01-01'),
    endDate: new Date('2022-12-01'),
    xp: 200,
  },
];

const mockUser = {
  id: mockUserId,
  name: 'Test User',
  username: 'testuser',
  image: null,
};

// =============================================================================
// Tests
// =============================================================================

describe('Experience Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getExperiencesByUserId', () => {
    it('returns experiences sorted by startDate descending', async () => {
      vi.mocked(prisma.experience.findMany).mockResolvedValue(mockExperiences);

      const result = await getExperiencesByUserId(mockUserId);

      expect(prisma.experience.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          orderBy: { startDate: 'desc' },
        })
      );
      expect(result.experiences).toHaveLength(2);
    });

    it('returns empty array when user has no experiences', async () => {
      vi.mocked(prisma.experience.findMany).mockResolvedValue([]);

      const result = await getExperiencesByUserId(mockUserId);

      expect(result.experiences).toEqual([]);
      expect(result.stats.totalXP).toBe(0);
    });

    it('calculates stats correctly', async () => {
      vi.mocked(prisma.experience.findMany).mockResolvedValue(mockExperiences);

      const result = await getExperiencesByUserId(mockUserId);

      expect(result.stats.totalXP).toBe(700); // 500 + 200
      expect(result.stats.totalExperiences).toBe(2);
    });
  });

  describe('getExperienceById', () => {
    it('returns experience when found', async () => {
      vi.mocked(prisma.experience.findUnique).mockResolvedValue(mockExperience);

      const result = await getExperienceById(mockExperienceId);

      expect(prisma.experience.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockExperienceId },
        })
      );
      expect(result).toEqual(mockExperience);
    });

    it('returns null when experience not found', async () => {
      vi.mocked(prisma.experience.findUnique).mockResolvedValue(null);

      const result = await getExperienceById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('createExperience', () => {
    it('creates experience with auto-calculated XP', async () => {
      const input = {
        userId: mockUserId,
        type: 'WORK' as const,
        title: 'New Job',
        company: 'New Corp',
        latitude: -34.6037,
        longitude: -58.3816,
        address: 'Buenos Aires, Argentina',
        startDate: new Date('2024-01-01'),
        description: 'New role',
        skills: ['TypeScript'],
      };

      vi.mocked(prisma.experience.create).mockResolvedValue({
        ...input,
        id: 'clexp-new',
        endDate: null,
        xp: XP_VALUES.WORK,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createExperience(input);

      expect(prisma.experience.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            type: 'WORK',
            xp: XP_VALUES.WORK, // 500
          }),
        })
      );
      expect(result.xp).toBe(500);
    });

    it('calculates correct XP for each experience type', async () => {
      const types = ['WORK', 'PROJECT', 'CERTIFICATION', 'EDUCATION'] as const;
      const expectedXP = [500, 350, 400, 200];

      for (let i = 0; i < types.length; i++) {
        const input = {
          userId: mockUserId,
          type: types[i],
          title: 'Test',
          company: 'Test',
          latitude: 0,
          longitude: 0,
          address: 'Test',
          startDate: new Date(),
          description: 'Test',
        };

        vi.mocked(prisma.experience.create).mockResolvedValue({
          ...input,
          id: `clexp-${i}`,
          endDate: null,
          skills: [],
          xp: expectedXP[i],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const result = await createExperience(input);
        expect(result.xp).toBe(expectedXP[i]);
      }
    });
  });

  describe('updateExperience', () => {
    it('updates experience fields correctly', async () => {
      const updateData = {
        id: mockExperienceId,
        title: 'Updated Title',
        company: 'Updated Company',
      };

      vi.mocked(prisma.experience.update).mockResolvedValue({
        ...mockExperience,
        ...updateData,
        updatedAt: new Date(),
      });

      const result = await updateExperience(updateData);

      expect(prisma.experience.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockExperienceId },
          data: expect.objectContaining({
            title: 'Updated Title',
            company: 'Updated Company',
          }),
        })
      );
      expect(result.title).toBe('Updated Title');
    });

    it('recalculates XP when type changes', async () => {
      const updateData = {
        id: mockExperienceId,
        type: 'PROJECT' as const,
      };

      vi.mocked(prisma.experience.update).mockResolvedValue({
        ...mockExperience,
        type: 'PROJECT',
        xp: XP_VALUES.PROJECT,
        updatedAt: new Date(),
      });

      const result = await updateExperience(updateData);

      expect(result.xp).toBe(350); // PROJECT XP
    });
  });

  describe('deleteExperience', () => {
    it('deletes experience by id', async () => {
      vi.mocked(prisma.experience.delete).mockResolvedValue(mockExperience);

      await deleteExperience(mockExperienceId);

      expect(prisma.experience.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockExperienceId },
        })
      );
    });
  });

  describe('getPublicTimelineByUsername', () => {
    it('returns timeline data for valid username', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        experiences: mockExperiences,
      } as any);

      const result = await getPublicTimelineByUsername('testuser');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { username: 'testuser' },
          include: expect.objectContaining({
            experiences: expect.any(Object),
          }),
        })
      );
      expect(result).not.toBeNull();
      expect(result?.user.username).toBe('testuser');
    });

    it('returns null for non-existent username', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await getPublicTimelineByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });
});
