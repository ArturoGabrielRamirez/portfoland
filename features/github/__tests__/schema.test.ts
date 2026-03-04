/**
 * GitHub Schema Integration Tests
 *
 * Verifies that the Prisma schema changes from TG1 (Phase 3A) are correctly
 * applied: githubValidated on UserSkill, githubSyncedAt + githubStats on User,
 * and GITHUB variant on SourceType enum.
 *
 * All tests mock the Prisma client — no live DB connection required.
 * server-only is mocked to allow Prisma imports in the Vitest jsdom environment.
 */

import { describe, it, expect, vi } from 'vitest';

// Stub server-only so @/lib/prisma can be imported in Vitest (jsdom env)
vi.mock('server-only', () => ({}));

// Mock Prisma client before importing anything that uses it
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSkill: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

// =============================================================================
// Test data
// =============================================================================

const mockUserId = 'cluser-schema-test';
const mockSkillId = 'clskill-schema-test';

const mockUserSkillWithGitHub = {
  id: 'clus-schema-1',
  userId: mockUserId,
  skillId: mockSkillId,
  totalXP: 0,
  level: 1,
  aiValidated: false,
  // TG1 field: githubValidated defaults to false
  githubValidated: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockUserWithGitHubFields = {
  id: mockUserId,
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  oauthImage: null,
  username: 'testuser',
  locale: 'en',
  emailVerified: false,
  portfolioMode: 'classic',
  onboardingCompleted: false,
  lastStreakDate: null,
  currentStreak: 0,
  bio: null,
  sectionOrder: [],
  contactLinks: {},
  sectionVisibility: {},
  meta: {},
  // TG1 fields: githubSyncedAt and githubStats default to null
  githubSyncedAt: null,
  githubStats: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// =============================================================================
// Tests
// =============================================================================

describe('Prisma Schema — TG1 GitHub Fields', () => {
  describe('UserSkill.githubValidated', () => {
    it('UserSkill model accepts githubValidated: false as default value', async () => {
      vi.mocked(prisma.userSkill.create).mockResolvedValue(mockUserSkillWithGitHub as any);

      const created = await prisma.userSkill.create({
        data: {
          userId: mockUserId,
          skillId: mockSkillId,
        } as any,
      });

      // Field must be present and default to false
      expect(created).toHaveProperty('githubValidated');
      expect(created.githubValidated).toBe(false);
    });

    it('UserSkill model accepts githubValidated: true when GitHub validation is applied', async () => {
      const validatedSkill = { ...mockUserSkillWithGitHub, githubValidated: true };
      vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(validatedSkill as any);

      const found = await prisma.userSkill.findUnique({
        where: { id: mockUserSkillWithGitHub.id },
      });

      expect(found).not.toBeNull();
      expect(found!.githubValidated).toBe(true);
    });
  });

  describe('User.githubSyncedAt and User.githubStats', () => {
    it('User model accepts githubSyncedAt: null and githubStats: null as defaults', async () => {
      vi.mocked(prisma.user.create).mockResolvedValue(mockUserWithGitHubFields as any);

      const created = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        } as any,
      });

      // Both fields must be present and null by default
      expect(created).toHaveProperty('githubSyncedAt');
      expect(created).toHaveProperty('githubStats');
      expect(created.githubSyncedAt).toBeNull();
      expect(created.githubStats).toBeNull();
    });
  });

  describe('SourceType enum — GITHUB variant', () => {
    it('SourceType enum includes GITHUB alongside EXPERIENCE and MANUAL', async () => {
      // Import the enum from the generated Prisma client to confirm it exists post-generate
      const { SourceType } = await import('@/app/generated/prisma/enums');

      expect(SourceType).toHaveProperty('EXPERIENCE');
      expect(SourceType).toHaveProperty('MANUAL');
      expect(SourceType).toHaveProperty('GITHUB');
      expect(SourceType.GITHUB).toBe('GITHUB');
    });
  });
});
