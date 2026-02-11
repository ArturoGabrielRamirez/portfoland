/**
 * Skill Tree Gap Tests
 *
 * Additional tests for critical user workflows identified during gap analysis.
 * Focus areas:
 * - XP recalculation on experience delete
 * - Category deletion with existing skills
 * - Experience-skill sync edge cases
 * - Mixed sources XP aggregation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    skill: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    skillCategory: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    userSkill: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    skillSource: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn(vi.mocked)),
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

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';

// =============================================================================
// Mock Data
// =============================================================================

const mockUserId = 'user-123';
const mockCategoryId = 'cat-frontend';
const mockExperienceId = 'exp-123';

const mockCategory = {
  id: mockCategoryId,
  name: 'Frontend',
  slug: 'frontend',
  color: '#A855F7',
  isDefault: false,
  userId: mockUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserSkill = {
  id: 'us-1',
  userId: mockUserId,
  skillId: 'skill-1',
  totalXP: 550,
  level: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  skill: {
    id: 'skill-1',
    name: 'React',
    slug: 'react',
    categoryId: mockCategoryId,
    category: mockCategory,
  },
  sources: [
    {
      id: 'src-1',
      userSkillId: 'us-1',
      sourceType: 'EXPERIENCE' as const,
      experienceId: mockExperienceId,
      xpAmount: 250,
      metadata: null,
    },
    {
      id: 'src-2',
      userSkillId: 'us-1',
      sourceType: 'MANUAL' as const,
      experienceId: null,
      xpAmount: 300,
      metadata: { selfAssessmentLevel: 'INTERMEDIATE' },
    },
  ],
};

// =============================================================================
// Test: XP Recalculation on Experience Delete
// =============================================================================

describe('XP Recalculation on Experience Delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recalculates user skill XP after experience source is removed', async () => {
    const { removeSourcesByExperienceData } = await import(
      '../data/deleteUserSkill.data'
    );

    // Mock: find sources for this experience
    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([
      {
        id: 'src-1',
        userSkillId: 'us-1',
        sourceType: 'EXPERIENCE',
        experienceId: mockExperienceId,
        xpAmount: 250,
        metadata: null,
        createdAt: new Date(),
      } as any,
    ]);

    // Mock: delete many sources
    vi.mocked(prisma.skillSource.deleteMany).mockResolvedValue({ count: 1 });

    // Mock: remaining sources after delete (only manual)
    vi.mocked(prisma.skillSource.findMany)
      .mockResolvedValueOnce([
        {
          id: 'src-1',
          userSkillId: 'us-1',
          sourceType: 'EXPERIENCE',
          experienceId: mockExperienceId,
          xpAmount: 250,
          metadata: null,
          createdAt: new Date(),
        } as any,
      ])
      .mockResolvedValueOnce([
        { xpAmount: 300 } as any, // Remaining manual source
      ]);

    // Mock: update user skill with new totals
    vi.mocked(prisma.userSkill.update).mockResolvedValue({
      ...mockUserSkill,
      totalXP: 300,
      level: 2,
    } as any);

    const count = await removeSourcesByExperienceData(mockExperienceId);

    expect(count).toBe(1);
    expect(prisma.userSkill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'us-1' },
        data: {
          totalXP: 300,
          level: 2,
        },
      })
    );
  });

  it('deletes user skill when all sources are removed', async () => {
    const { removeSourcesByExperienceData } = await import(
      '../data/deleteUserSkill.data'
    );

    // Mock: find sources for this experience
    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([
      {
        id: 'src-1',
        userSkillId: 'us-1',
        sourceType: 'EXPERIENCE',
        experienceId: mockExperienceId,
        xpAmount: 250,
        metadata: null,
        createdAt: new Date(),
      } as any,
    ]);

    // Mock: delete many sources
    vi.mocked(prisma.skillSource.deleteMany).mockResolvedValue({ count: 1 });

    // Mock: no remaining sources
    vi.mocked(prisma.skillSource.findMany)
      .mockResolvedValueOnce([
        {
          id: 'src-1',
          userSkillId: 'us-1',
          sourceType: 'EXPERIENCE',
          experienceId: mockExperienceId,
          xpAmount: 250,
          metadata: null,
          createdAt: new Date(),
        } as any,
      ])
      .mockResolvedValueOnce([]); // No remaining sources

    // Mock: delete user skill
    vi.mocked(prisma.userSkill.delete).mockResolvedValue(mockUserSkill as any);

    const count = await removeSourcesByExperienceData(mockExperienceId);

    expect(count).toBe(1);
    expect(prisma.userSkill.delete).toHaveBeenCalledWith({
      where: { id: 'us-1' },
    });
  });
});

// =============================================================================
// Test: Category Deletion with Existing Skills
// =============================================================================

describe('Category Deletion with Existing Skills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents deletion of category with assigned skills', async () => {
    const { deleteSkillCategoryData } = await import(
      '../data/createSkillCategory.data'
    );

    // Mock: category with skills count
    vi.mocked(prisma.skillCategory.findUnique).mockResolvedValue({
      ...mockCategory,
      _count: { skills: 3 },
    } as any);

    const result = await deleteSkillCategoryData(mockCategoryId, mockUserId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('assigned skills');
    expect(prisma.skillCategory.delete).not.toHaveBeenCalled();
  });

  it('allows deletion of empty custom category', async () => {
    const { deleteSkillCategoryData } = await import(
      '../data/createSkillCategory.data'
    );

    // Mock: category with no skills
    vi.mocked(prisma.skillCategory.findUnique).mockResolvedValue({
      ...mockCategory,
      _count: { skills: 0 },
    } as any);

    // Mock: successful deletion
    vi.mocked(prisma.skillCategory.delete).mockResolvedValue(
      mockCategory as any
    );

    const result = await deleteSkillCategoryData(mockCategoryId, mockUserId);

    expect(result.success).toBe(true);
    expect(prisma.skillCategory.delete).toHaveBeenCalledWith({
      where: { id: mockCategoryId },
    });
  });

  it('prevents deletion of default categories', async () => {
    const { deleteSkillCategoryData } = await import(
      '../data/createSkillCategory.data'
    );

    // Mock: default category
    vi.mocked(prisma.skillCategory.findUnique).mockResolvedValue({
      ...mockCategory,
      isDefault: true,
      userId: null,
      _count: { skills: 0 },
    } as any);

    const result = await deleteSkillCategoryData(mockCategoryId, mockUserId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('default');
    expect(prisma.skillCategory.delete).not.toHaveBeenCalled();
  });
});

// =============================================================================
// Test: Experience-Skill Sync Edge Cases
// =============================================================================

describe('Experience-Skill Sync Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes skill names to same slug for case variations', async () => {
    // Import the normalize function behavior test
    const { syncSkillFromExperienceData } = await import(
      '../data/syncSkillFromExperience.data'
    );

    const mockSkill = {
      id: 'skill-1',
      name: 'react',
      slug: 'react',
      categoryId: mockCategoryId,
      isCore: false,
    };

    // Mock: skill already exists
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
      const tx = {
        skill: {
          findUnique: vi.fn().mockResolvedValue(mockSkill),
          create: vi.fn(),
        },
        userSkill: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'us-new',
            userId: mockUserId,
            skillId: mockSkill.id,
            totalXP: 100,
            level: 1,
            skill: { ...mockSkill, category: mockCategory },
            sources: [],
          }),
        },
        skillSource: {
          aggregate: vi.fn(),
        },
      };
      return fn(tx);
    });

    // "REACT" should normalize to "react" slug
    const result = await syncSkillFromExperienceData({
      userId: mockUserId,
      experienceId: mockExperienceId,
      skillName: 'REACT', // Uppercase
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-04-01'),
      defaultCategoryId: mockCategoryId,
    });

    expect(result).toBeDefined();
    expect(result.skill.slug).toBe('react');
  });

  it('removes unlinked skill sources when experience skills are updated', async () => {
    const { removeUnlinkedSkillSourcesData } = await import(
      '../data/syncSkillFromExperience.data'
    );

    // Mock: current sources for experience
    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([
      {
        id: 'src-react',
        userSkillId: 'us-react',
        sourceType: 'EXPERIENCE',
        experienceId: mockExperienceId,
        xpAmount: 250,
        metadata: null,
        userSkill: {
          skill: { slug: 'react' },
        },
      } as any,
      {
        id: 'src-typescript',
        userSkillId: 'us-ts',
        sourceType: 'EXPERIENCE',
        experienceId: mockExperienceId,
        xpAmount: 250,
        metadata: null,
        userSkill: {
          skill: { slug: 'typescript' },
        },
      } as any,
    ]);

    // Mock delete
    vi.mocked(prisma.skillSource.deleteMany).mockResolvedValue({ count: 1 });

    // React was removed from experience, only TypeScript remains
    await removeUnlinkedSkillSourcesData(mockExperienceId, ['typescript']);

    // Should delete React source
    expect(prisma.skillSource.deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['src-react'] },
      },
    });
  });
});

// =============================================================================
// Test: Mixed Sources XP Aggregation
// =============================================================================

describe('Mixed Sources XP Aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly aggregates XP from both EXPERIENCE and MANUAL sources', async () => {
    const { recalculateUserSkillXPData } = await import(
      '../data/updateUserSkill.data'
    );

    // Mock: user skill with mixed sources
    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue({
      id: 'us-1',
      userId: mockUserId,
      skillId: 'skill-1',
      totalXP: 0, // Will be recalculated
      level: 1,
    } as any);

    // Mock: aggregate all sources
    vi.mocked(prisma.skillSource.aggregate).mockResolvedValue({
      _sum: { xpAmount: 850 }, // 500 (EXPERIENCE) + 300 (MANUAL) + 50 (another)
    } as any);

    // Mock: update with new totals
    vi.mocked(prisma.userSkill.update).mockResolvedValue({
      id: 'us-1',
      userId: mockUserId,
      skillId: 'skill-1',
      totalXP: 850,
      level: 3, // Journeyman: 500-999
    } as any);

    const result = await recalculateUserSkillXPData('us-1');

    expect(result.totalXP).toBe(850);
    expect(result.level).toBe(3);
  });

  it('updates level correctly when XP crosses threshold', async () => {
    const { recalculateUserSkillXPData } = await import(
      '../data/updateUserSkill.data'
    );

    // Mock: user skill about to level up
    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue({
      id: 'us-1',
      userId: mockUserId,
      skillId: 'skill-1',
      totalXP: 450,
      level: 2, // Apprentice
    } as any);

    // Mock: new total crosses 500 threshold
    vi.mocked(prisma.skillSource.aggregate).mockResolvedValue({
      _sum: { xpAmount: 550 }, // Now Journeyman
    } as any);

    // Mock: update with new level
    vi.mocked(prisma.userSkill.update).mockResolvedValue({
      id: 'us-1',
      userId: mockUserId,
      skillId: 'skill-1',
      totalXP: 550,
      level: 3, // Level up to Journeyman
    } as any);

    const result = await recalculateUserSkillXPData('us-1');

    expect(result.totalXP).toBe(550);
    expect(result.level).toBe(3);
  });
});

// =============================================================================
// Test: Skill Tree Sync Integration
// =============================================================================

describe('Experience Service Skill Sync Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes skill sources when experience is deleted', async () => {
    // This tests the integration point in experience.service.ts
    // where removeSourcesByExperienceData is called before experience delete

    const { removeSourcesByExperienceData } = await import(
      '../data/deleteUserSkill.data'
    );

    // Mock: multiple skills linked to experience
    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([
      { id: 'src-1', userSkillId: 'us-1', xpAmount: 250 } as any,
      { id: 'src-2', userSkillId: 'us-2', xpAmount: 500 } as any,
    ]);

    vi.mocked(prisma.skillSource.deleteMany).mockResolvedValue({ count: 2 });

    // Mock: recalculation for affected skills
    vi.mocked(prisma.skillSource.findMany)
      .mockResolvedValueOnce([
        { id: 'src-1', userSkillId: 'us-1', xpAmount: 250 } as any,
        { id: 'src-2', userSkillId: 'us-2', xpAmount: 500 } as any,
      ])
      .mockResolvedValueOnce([{ xpAmount: 100 } as any]) // us-1 has another source
      .mockResolvedValueOnce([]); // us-2 has no other sources

    vi.mocked(prisma.userSkill.update).mockResolvedValue({} as any);
    vi.mocked(prisma.userSkill.delete).mockResolvedValue({} as any);

    const count = await removeSourcesByExperienceData(mockExperienceId);

    expect(count).toBe(2);
    // us-1 should be updated (has remaining sources)
    expect(prisma.userSkill.update).toHaveBeenCalled();
    // us-2 should be deleted (no remaining sources)
    expect(prisma.userSkill.delete).toHaveBeenCalled();
  });
});
