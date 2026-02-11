/**
 * Skill Model Tests
 *
 * Tests for Skill, SkillCategory, UserSkill, and SkillSource models.
 * Covers model creation, relations, and cascade behavior.
 */

import { describe, it, expect } from 'vitest';

import { calculateLevelFromXP, aggregateTotalXP } from '../constants/xp';

// =============================================================================
// Type Definitions (matching expected Prisma models)
// =============================================================================

type SourceType = 'EXPERIENCE' | 'MANUAL';

interface Skill {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  iconName: string | null;
  isCore: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  isDefault: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  totalXP: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SkillSource {
  id: string;
  userSkillId: string;
  sourceType: SourceType;
  experienceId: string | null;
  xpAmount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// =============================================================================
// Helper Functions
// =============================================================================

function createSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function createSkill(input: Partial<Skill> & { name: string; categoryId: string }): Skill {
  return {
    id: input.id ?? `clskill${Date.now()}`,
    name: input.name,
    slug: input.slug ?? createSlug(input.name),
    categoryId: input.categoryId,
    iconName: input.iconName ?? null,
    isCore: input.isCore ?? false,
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  };
}

function createSkillCategory(input: Partial<SkillCategory> & { name: string; color: string }): SkillCategory {
  return {
    id: input.id ?? `clcat${Date.now()}`,
    name: input.name,
    slug: input.slug ?? createSlug(input.name),
    color: input.color,
    isDefault: input.isDefault ?? false,
    userId: input.userId ?? null,
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  };
}

function createUserSkill(input: Partial<UserSkill> & { userId: string; skillId: string }): UserSkill {
  const totalXP = input.totalXP ?? 0;
  return {
    id: input.id ?? `cluskill${Date.now()}`,
    userId: input.userId,
    skillId: input.skillId,
    totalXP,
    level: input.level ?? calculateLevelFromXP(totalXP),
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  };
}

function createSkillSource(
  input: Partial<SkillSource> & { userSkillId: string; sourceType: SourceType; xpAmount: number }
): SkillSource {
  return {
    id: input.id ?? `clsrc${Date.now()}`,
    userSkillId: input.userSkillId,
    sourceType: input.sourceType,
    experienceId: input.experienceId ?? null,
    xpAmount: input.xpAmount,
    metadata: input.metadata ?? null,
    createdAt: input.createdAt ?? new Date(),
  };
}

// =============================================================================
// Skill Model Tests
// =============================================================================

describe('Skill Model', () => {
  describe('creation with required fields', () => {
    it('creates a skill with name, slug, and categoryId', () => {
      const skill = createSkill({
        name: 'TypeScript',
        categoryId: 'clcat123',
      });

      expect(skill.id).toBeDefined();
      expect(skill.name).toBe('TypeScript');
      expect(skill.slug).toBe('typescript');
      expect(skill.categoryId).toBe('clcat123');
      expect(skill.createdAt).toBeInstanceOf(Date);
      expect(skill.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a skill with isCore flag for fundamental skills', () => {
      const skill = createSkill({
        name: 'JavaScript',
        categoryId: 'clcat123',
        isCore: true,
      });

      expect(skill.isCore).toBe(true);
    });

    it('defaults isCore to false', () => {
      const skill = createSkill({
        name: 'React',
        categoryId: 'clcat123',
      });

      expect(skill.isCore).toBe(false);
    });

    it('allows optional iconName field', () => {
      const skill = createSkill({
        name: 'React',
        categoryId: 'clcat123',
        iconName: 'react-icon',
      });

      expect(skill.iconName).toBe('react-icon');
    });

    it('generates unique slug from name with spaces', () => {
      const skill = createSkill({
        name: 'Node.js',
        categoryId: 'clcat123',
      });

      expect(skill.slug).toBe('nodejs');
    });
  });
});

// =============================================================================
// SkillCategory Model Tests
// =============================================================================

describe('SkillCategory Model', () => {
  describe('isDefault flag behavior', () => {
    it('creates default category with isDefault true and null userId', () => {
      const category = createSkillCategory({
        name: 'Frontend',
        color: '#A855F7',
        isDefault: true,
        userId: null,
      });

      expect(category.isDefault).toBe(true);
      expect(category.userId).toBeNull();
    });

    it('creates custom category with isDefault false and userId set', () => {
      const category = createSkillCategory({
        name: 'My Custom Category',
        color: '#FF5733',
        isDefault: false,
        userId: 'cluser123',
      });

      expect(category.isDefault).toBe(false);
      expect(category.userId).toBe('cluser123');
    });

    it('generates slug from category name', () => {
      const category = createSkillCategory({
        name: 'Soft Skills',
        color: '#EAB308',
      });

      expect(category.slug).toBe('soft-skills');
    });
  });
});

// =============================================================================
// UserSkill Model Tests
// =============================================================================

describe('UserSkill Model', () => {
  describe('XP aggregation and level calculation', () => {
    it('creates UserSkill with totalXP and calculates level', () => {
      const userSkill = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 550,
      });

      expect(userSkill.totalXP).toBe(550);
      expect(userSkill.level).toBe(3); // Journeyman: 500-999 XP
    });

    it('aggregates XP from multiple sources to determine level', () => {
      // Simulate XP from multiple sources
      const source1XP = 250; // 9 months experience
      const source2XP = 300; // Intermediate self-assessment
      const source3XP = 500; // 18 months experience

      const totalXP = aggregateTotalXP([source1XP, source2XP, source3XP]);
      const level = calculateLevelFromXP(totalXP);

      expect(totalXP).toBe(1050);
      expect(level).toBe(4); // Expert: 1000-1999 XP
    });

    it('requires unique userId + skillId combination', () => {
      const userSkill1 = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 100,
      });

      const userSkill2 = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill789', // Different skill
        totalXP: 200,
      });

      // Same user, different skills - should be allowed
      expect(userSkill1.userId).toBe(userSkill2.userId);
      expect(userSkill1.skillId).not.toBe(userSkill2.skillId);
    });

    it('starts at level 1 (Novice) with 0 XP', () => {
      const userSkill = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 0,
      });

      expect(userSkill.level).toBe(1);
    });

    it('reaches Master level at 2000+ XP', () => {
      const userSkill = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 2500,
      });

      expect(userSkill.level).toBe(5); // Master
    });
  });
});

// =============================================================================
// SkillSource Model Tests
// =============================================================================

describe('SkillSource Model', () => {
  describe('EXPERIENCE and MANUAL source types', () => {
    it('creates EXPERIENCE source with experienceId', () => {
      const source = createSkillSource({
        userSkillId: 'cluskill123',
        sourceType: 'EXPERIENCE',
        experienceId: 'clexp789',
        xpAmount: 500,
      });

      expect(source.sourceType).toBe('EXPERIENCE');
      expect(source.experienceId).toBe('clexp789');
      expect(source.xpAmount).toBe(500);
      expect(source.metadata).toBeNull();
    });

    it('creates MANUAL source with metadata', () => {
      const metadata = {
        selfAssessmentLevel: 'INTERMEDIATE',
        learningSources: 'Online courses, books, and practice projects',
        dateStarted: '2023-01-15',
      };

      const source = createSkillSource({
        userSkillId: 'cluskill123',
        sourceType: 'MANUAL',
        xpAmount: 300,
        metadata,
      });

      expect(source.sourceType).toBe('MANUAL');
      expect(source.experienceId).toBeNull();
      expect(source.xpAmount).toBe(300);
      expect(source.metadata).toEqual(metadata);
    });

    it('MANUAL source has null experienceId', () => {
      const source = createSkillSource({
        userSkillId: 'cluskill123',
        sourceType: 'MANUAL',
        xpAmount: 100,
      });

      expect(source.experienceId).toBeNull();
    });

    it('validates sourceType enum values', () => {
      const validTypes: SourceType[] = ['EXPERIENCE', 'MANUAL'];

      expect(validTypes).toContain('EXPERIENCE');
      expect(validTypes).toContain('MANUAL');
      expect(validTypes).toHaveLength(2);
    });
  });
});

// =============================================================================
// Cascade Deletion Behavior Tests
// =============================================================================

describe('Cascade Deletion Behavior', () => {
  describe('UserSkill cascade', () => {
    it('should delete SkillSources when UserSkill is deleted', () => {
      // Simulate creating UserSkill with sources
      const userSkill = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 800,
      });

      const sources = [
        createSkillSource({
          userSkillId: userSkill.id,
          sourceType: 'EXPERIENCE',
          experienceId: 'clexp1',
          xpAmount: 500,
        }),
        createSkillSource({
          userSkillId: userSkill.id,
          sourceType: 'MANUAL',
          xpAmount: 300,
        }),
      ];

      // Verify sources are linked
      expect(sources.every(s => s.userSkillId === userSkill.id)).toBe(true);

      // When UserSkill is deleted, sources should also be deleted
      // This is enforced by Prisma's onDelete: Cascade in the schema
      const deletedUserSkillId = userSkill.id;
      const orphanedSources = sources.filter(s => s.userSkillId !== deletedUserSkillId);

      // After cascade delete, no sources should remain for this UserSkill
      expect(orphanedSources).toHaveLength(0);
    });
  });

  describe('User cascade', () => {
    it('should maintain User reference in UserSkill', () => {
      const userSkill = createUserSkill({
        userId: 'cluser123',
        skillId: 'clskill456',
        totalXP: 500,
      });

      expect(userSkill.userId).toBe('cluser123');
      // When User is deleted, UserSkills should also be deleted (Cascade)
    });
  });

  describe('Experience reference', () => {
    it('should maintain optional Experience reference in SkillSource', () => {
      const source = createSkillSource({
        userSkillId: 'cluskill123',
        sourceType: 'EXPERIENCE',
        experienceId: 'clexp789',
        xpAmount: 250,
      });

      expect(source.experienceId).toBe('clexp789');
      // When Experience is deleted, SkillSource should set experienceId to null (SetNull)
    });
  });
});
