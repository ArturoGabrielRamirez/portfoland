/**
 * Skill Actions and Services Tests
 *
 * Tests for skill service layer and server actions.
 * Covers core user flows: create, update, delete, and experience sync.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSkill: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    skill: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    skillCategory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
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
import { auth } from '@/lib/auth';

// =============================================================================
// Service Tests
// =============================================================================

describe('Skill Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSkillService', () => {
    it('creates a skill with valid input', async () => {
      // Import after mocks are set up
      const { createSkillService } = await import('../services/skill.service');

      // Mock the data layer functions
      const mockUserSkill = {
        id: 'us-123',
        userId: 'user-1',
        skillId: 'skill-1',
        totalXP: 100,
        level: 1,
        skill: {
          id: 'skill-1',
          name: 'TypeScript',
          slug: 'typescript',
          categoryId: 'cat-1',
          category: {
            id: 'cat-1',
            name: 'Frontend',
            slug: 'frontend',
            color: '#A855F7',
            isDefault: true,
          },
        },
        sources: [
          {
            id: 'src-1',
            sourceType: 'MANUAL',
            xpAmount: 100,
            metadata: { selfAssessmentLevel: 'BEGINNER' },
            experience: null,
          },
        ],
      };

      const mockCategories = [
        {
          id: 'cat-core',
          name: 'Core',
          slug: 'core',
          color: '#00D4FF',
          isDefault: true,
        },
      ];

      // Mock the category lookup
      vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

      // Mock skill upsert
      vi.mocked(prisma.skill.upsert).mockResolvedValue({
        id: 'skill-1',
        name: 'TypeScript',
        slug: 'typescript',
        categoryId: 'cat-core',
        iconName: null,
        isCore: false,
      } as any);

      // Mock user skill create
      vi.mocked(prisma.userSkill.create).mockResolvedValue(mockUserSkill as any);

      // Mock transaction to execute function directly
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        return fn(prisma);
      });

      // Create skill through service
      const result = await createSkillService({
        userId: 'user-1',
        name: 'TypeScript',
        selfAssessmentLevel: 'BEGINNER',
      });

      // Verify the result
      expect(result).toBeDefined();
      expect(result.userId).toBe('user-1');
      expect(result.totalXP).toBe(100);
    });
  });

  describe('deleteSkillService', () => {
    it('prevents deletion of experience-linked skills', async () => {
      const { deleteSkillService } = await import('../services/skill.service');

      // Mock a skill that has an experience source
      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue({
        id: 'us-123',
        userId: 'user-1',
        skillId: 'skill-1',
        totalXP: 250,
        level: 2,
        sources: [
          {
            id: 'src-1',
            sourceType: 'EXPERIENCE',
            xpAmount: 250,
            experienceId: 'exp-1',
          },
        ],
      } as any);

      // Attempt to delete should fail
      await expect(
        deleteSkillService('us-123', 'user-1')
      ).rejects.toThrow('Cannot delete skill that is linked to experiences');
    });

    it('allows deletion of manual-only skills', async () => {
      const { deleteSkillService } = await import('../services/skill.service');

      // Mock a skill with only MANUAL source
      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue({
        id: 'us-123',
        userId: 'user-1',
        skillId: 'skill-1',
        totalXP: 100,
        level: 1,
        sources: [
          {
            id: 'src-1',
            sourceType: 'MANUAL',
            xpAmount: 100,
          },
        ],
      } as any);

      vi.mocked(prisma.userSkill.delete).mockResolvedValue({
        id: 'us-123',
        userId: 'user-1',
        skillId: 'skill-1',
        totalXP: 100,
        level: 1,
      } as any);

      // Delete should succeed
      const result = await deleteSkillService('us-123', 'user-1');

      expect(result.success).toBe(true);
    });
  });

  describe('updateSkillService', () => {
    it('checks ownership before updating', async () => {
      const { updateSkillService } = await import('../services/skill.service');

      // Mock a skill owned by a different user
      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue({
        id: 'us-123',
        userId: 'other-user',
        skillId: 'skill-1',
        totalXP: 100,
        level: 1,
        sources: [],
        skill: {
          category: { id: 'cat-1', name: 'Frontend' },
        },
      } as any);

      // Attempt to update should fail
      await expect(
        updateSkillService({
          id: 'us-123',
          userId: 'user-1',
          selfAssessmentLevel: 'INTERMEDIATE',
        })
      ).rejects.toThrow('Skill not found');
    });
  });
});

// =============================================================================
// syncSkillsFromExperience Tests
// =============================================================================

describe('syncSkillsFromExperienceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes all skills from an experience', async () => {
    const { syncSkillsFromExperienceService } = await import('../services/skill.service');

    // Mock default category lookup
    vi.mocked(prisma.skillCategory.findFirst).mockResolvedValue({
      id: 'cat-core',
      name: 'Core',
      slug: 'core',
      color: '#00D4FF',
      isDefault: true,
    } as any);

    // Mock skill and user skill operations
    const mockSkill = {
      id: 'skill-1',
      name: 'React',
      slug: 'react',
      categoryId: 'cat-core',
    };

    vi.mocked(prisma.skill.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.skill.create).mockResolvedValue(mockSkill as any);

    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userSkill.create).mockResolvedValue({
      id: 'us-1',
      userId: 'user-1',
      skillId: 'skill-1',
      totalXP: 100,
      level: 1,
      skill: { ...mockSkill, category: { id: 'cat-core', name: 'Core' } },
      sources: [{ id: 'src-1', sourceType: 'EXPERIENCE', xpAmount: 100 }],
    } as any);

    // Mock transaction
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(prisma));

    // Mock the sources lookup for unlinked skills removal
    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([]);

    const result = await syncSkillsFromExperienceService({
      userId: 'user-1',
      experienceId: 'exp-1',
      skills: ['React', 'TypeScript'],
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-04-01'),
    });

    // Should have processed skills
    expect(Array.isArray(result)).toBe(true);
  });

  it('filters out empty skill names', async () => {
    const { syncSkillsFromExperienceService } = await import('../services/skill.service');

    // Mock empty result when no valid skills
    vi.mocked(prisma.skillCategory.findFirst).mockResolvedValue({
      id: 'cat-core',
      name: 'Core',
      slug: 'core',
    } as any);

    vi.mocked(prisma.skillSource.findMany).mockResolvedValue([]);

    const result = await syncSkillsFromExperienceService({
      userId: 'user-1',
      experienceId: 'exp-1',
      skills: ['', '  ', '   '], // All empty/whitespace
      startDate: new Date('2024-01-01'),
      endDate: null,
    });

    // Should return empty array
    expect(result).toEqual([]);
  });
});

// =============================================================================
// Server Action Tests
// =============================================================================

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSkill action', () => {
    it('validates input with createSkillSchema', async () => {
      const { createSkill } = await import('../actions/createSkill');

      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { id: 'session-1' },
      } as any);

      // Call with invalid data (missing required field)
      const result = await createSkill({
        name: '', // Empty name should fail validation
        selfAssessmentLevel: 'BEGINNER',
      });

      // Should return validation error
      expect(result.hasError).toBe(true);
      expect(result.message).toContain('Skill name');
    });

    it('requires authentication', async () => {
      const { createSkill } = await import('../actions/createSkill');

      // Mock no session
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createSkill({
        name: 'TypeScript',
        selfAssessmentLevel: 'BEGINNER',
      });

      // Should return auth error
      expect(result.hasError).toBe(true);
      expect(result.message).toContain('sign in');
    });
  });

  describe('deleteSkill action', () => {
    it('validates skill ID is provided', async () => {
      const { deleteSkill } = await import('../actions/deleteSkill');

      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-1', email: 'test@example.com' },
        session: { id: 'session-1' },
      } as any);

      // Call with missing ID
      const result = await deleteSkill({ id: '' });

      // Should return validation error
      expect(result.hasError).toBe(true);
    });
  });
});
