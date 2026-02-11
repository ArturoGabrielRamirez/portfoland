/**
 * Skill Data Layer Tests
 *
 * Tests for data layer functions that handle database operations
 * for skills, user skills, skill sources, and categories.
 *
 * Tests are focused on core data operations:
 * - getUserSkillsData returns skills with sources
 * - createUserSkillData creates skill with source
 * - updateUserSkillXPData recalculates total XP
 * - getSkillCategoriesData returns default + custom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    skill: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    skillCategory: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    userSkill: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    skillSource: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Import after mock
import { prisma } from '@/lib/prisma';

// Import data functions
import {
  getSkillCategoriesData,
  getUserSkillsData,
  createUserSkillData,
  updateUserSkillData,
  deleteUserSkillData,
  createSkillCategoryData,
} from '../data';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';
const mockUserSkillId = 'cluserskill123';
const mockSkillId = 'clskill123456';
const mockCategoryId = 'clcat123456789';
const mockExperienceId = 'clexp123456789';

const mockCategory = {
  id: mockCategoryId,
  name: 'Frontend',
  slug: 'frontend',
  color: '#A855F7',
  isDefault: true,
  userId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCustomCategory = {
  id: 'clcat-custom',
  name: 'Custom Category',
  slug: 'custom-category',
  color: '#FF5733',
  isDefault: false,
  userId: mockUserId,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockSkill = {
  id: mockSkillId,
  name: 'React',
  slug: 'react',
  categoryId: mockCategoryId,
  iconName: 'react',
  isCore: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  category: mockCategory,
};

const mockUserSkill = {
  id: mockUserSkillId,
  userId: mockUserId,
  skillId: mockSkillId,
  totalXP: 500,
  level: 3,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  skill: mockSkill,
  sources: [],
};

const mockSkillSource = {
  id: 'clsource123',
  userSkillId: mockUserSkillId,
  sourceType: 'MANUAL' as const,
  experienceId: null,
  xpAmount: 300,
  metadata: { selfAssessmentLevel: 'INTERMEDIATE' },
  createdAt: new Date('2024-01-01'),
  experience: null,
};

const mockExperienceSource = {
  id: 'clsource456',
  userSkillId: mockUserSkillId,
  sourceType: 'EXPERIENCE' as const,
  experienceId: mockExperienceId,
  xpAmount: 250,
  metadata: null,
  createdAt: new Date('2024-01-01'),
  experience: {
    id: mockExperienceId,
    title: 'Senior Developer',
    company: 'Tech Corp',
    type: 'WORK',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
  },
};

// =============================================================================
// Tests
// =============================================================================

describe('Skill Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSkillCategoriesData', () => {
    it('returns default categories when user has no custom categories', async () => {
      vi.mocked(prisma.skillCategory.findMany).mockResolvedValue([mockCategory]);

      const result = await getSkillCategoriesData(mockUserId);

      expect(prisma.skillCategory.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isDefault).toBe(true);
    });

    it('returns merged default and custom categories sorted by name', async () => {
      vi.mocked(prisma.skillCategory.findMany).mockResolvedValue([
        mockCustomCategory,
        mockCategory,
      ]);

      const result = await getSkillCategoriesData(mockUserId);

      expect(result).toHaveLength(2);
      // Should be sorted by name
      expect(result[0].name).toBe('Custom Category');
      expect(result[1].name).toBe('Frontend');
    });
  });

  describe('getUserSkillsData', () => {
    it('returns user skills with skill details and sources', async () => {
      const userSkillWithSources = {
        ...mockUserSkill,
        sources: [mockSkillSource],
      };

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([userSkillWithSources]);

      const result = await getUserSkillsData(mockUserId);

      expect(prisma.userSkill.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          include: expect.objectContaining({
            skill: expect.any(Object),
            sources: expect.any(Object),
          }),
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].skill.name).toBe('React');
      expect(result[0].sources).toHaveLength(1);
    });

    it('returns empty array when user has no skills', async () => {
      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([]);

      const result = await getUserSkillsData(mockUserId);

      expect(result).toEqual([]);
    });

    it('includes experience data for EXPERIENCE sources', async () => {
      const userSkillWithExperienceSource = {
        ...mockUserSkill,
        sources: [mockExperienceSource],
      };

      vi.mocked(prisma.userSkill.findMany).mockResolvedValue([userSkillWithExperienceSource]);

      const result = await getUserSkillsData(mockUserId);

      expect(result[0].sources[0].experience).toBeDefined();
      expect(result[0].sources[0].experience?.title).toBe('Senior Developer');
    });
  });

  describe('createUserSkillData', () => {
    it('creates user skill with initial source and calculated level', async () => {
      const mockCreatedUserSkill = {
        ...mockUserSkill,
        totalXP: 300,
        level: 2,
        sources: [mockSkillSource],
      };

      // Mock transaction to execute the callback with mocked tx
      vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
        const tx = {
          skill: {
            upsert: vi.fn().mockResolvedValue(mockSkill),
          },
          userSkill: {
            create: vi.fn().mockResolvedValue(mockCreatedUserSkill),
          },
          skillSource: {
            create: vi.fn().mockResolvedValue(mockSkillSource),
          },
        };
        return fn(tx as any);
      });

      const result = await createUserSkillData({
        userId: mockUserId,
        skillName: 'React',
        categoryId: mockCategoryId,
        selfAssessmentLevel: 'INTERMEDIATE',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.totalXP).toBe(300);
      expect(result.level).toBe(2);
    });
  });

  describe('updateUserSkillData', () => {
    it('recalculates totalXP from all sources after update', async () => {
      const currentUserSkill = {
        ...mockUserSkill,
        sources: [mockSkillSource],
      };

      const updatedUserSkill = {
        ...mockUserSkill,
        totalXP: 550,
        level: 3,
        sources: [
          { ...mockSkillSource, xpAmount: 300 },
          { ...mockExperienceSource, xpAmount: 250 },
        ],
      };

      // Mock transaction
      vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
        const tx = {
          userSkill: {
            findUnique: vi.fn().mockResolvedValue(currentUserSkill),
            update: vi.fn().mockResolvedValue(updatedUserSkill),
          },
          skillSource: {
            update: vi.fn().mockResolvedValue(mockSkillSource),
            aggregate: vi.fn().mockResolvedValue({ _sum: { xpAmount: 550 } }),
          },
        };
        return fn(tx as any);
      });

      const result = await updateUserSkillData({
        id: mockUserSkillId,
        userId: mockUserId,
        selfAssessmentLevel: 'INTERMEDIATE',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.totalXP).toBe(550);
      expect(result.level).toBe(3);
    });
  });

  describe('deleteUserSkillData', () => {
    it('deletes user skill when no EXPERIENCE sources exist', async () => {
      const userSkillWithManualSource = {
        ...mockUserSkill,
        sources: [{ ...mockSkillSource, sourceType: 'MANUAL' as const }],
      };

      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(userSkillWithManualSource);
      vi.mocked(prisma.userSkill.delete).mockResolvedValue(mockUserSkill);

      const result = await deleteUserSkillData(mockUserSkillId, mockUserId);

      expect(result.success).toBe(true);
      expect(prisma.userSkill.delete).toHaveBeenCalledWith({
        where: { id: mockUserSkillId },
      });
    });

    it('returns error when EXPERIENCE sources exist', async () => {
      const userSkillWithExperienceSource = {
        ...mockUserSkill,
        sources: [{ ...mockExperienceSource, sourceType: 'EXPERIENCE' as const }],
      };

      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(userSkillWithExperienceSource);

      const result = await deleteUserSkillData(mockUserSkillId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('experience');
      expect(prisma.userSkill.delete).not.toHaveBeenCalled();
    });

    it('returns error when skill not found', async () => {
      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(null);

      const result = await deleteUserSkillData(mockUserSkillId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('returns error when user does not own the skill', async () => {
      const otherUserSkill = {
        ...mockUserSkill,
        userId: 'other-user-id',
        sources: [mockSkillSource],
      };

      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(otherUserSkill);

      const result = await deleteUserSkillData(mockUserSkillId, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('authorized');
    });
  });

  describe('createSkillCategoryData', () => {
    it('creates custom category for user', async () => {
      vi.mocked(prisma.skillCategory.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.skillCategory.create).mockResolvedValue(mockCustomCategory);

      const result = await createSkillCategoryData({
        userId: mockUserId,
        name: 'Custom Category',
        color: '#FF5733',
      });

      expect(prisma.skillCategory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            name: 'Custom Category',
            isDefault: false,
          }),
        })
      );
      expect(result.isDefault).toBe(false);
    });

    it('returns error for duplicate category name', async () => {
      vi.mocked(prisma.skillCategory.findFirst).mockResolvedValue(mockCustomCategory);

      await expect(
        createSkillCategoryData({
          userId: mockUserId,
          name: 'Custom Category',
          color: '#FF5733',
        })
      ).rejects.toThrow('already exists');
    });
  });
});
