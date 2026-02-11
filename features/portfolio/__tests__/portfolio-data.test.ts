/**
 * Portfolio Data Layer Tests
 *
 * Tests for data layer functions that handle portfolio database operations:
 * - getPortfolioByUsername returns aggregated data for a valid username
 * - getPortfolioByUsername returns null for a non-existent username
 * - getPublicProjectsByUsername returns only experiences with type: PROJECT
 * - updatePortfolioModeData correctly updates the portfolioMode field
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    experience: {
      findMany: vi.fn(),
    },
  },
}));

// Mock dependent data functions
vi.mock('@/features/timeline/data/getPublicTimeline.data', () => ({
  getPublicTimelineByUsername: vi.fn(),
}));

vi.mock('@/features/skills/data/getPublicSkills.data', () => ({
  getPublicSkillsByUsername: vi.fn(),
}));

// Import after mocks
import { prisma } from '@/lib/prisma';
import { getPublicTimelineByUsername } from '@/features/timeline/data/getPublicTimeline.data';
import { getPublicSkillsByUsername } from '@/features/skills/data/getPublicSkills.data';
import { getPortfolioByUsername } from '../data/getPortfolio.data';
import { getPublicProjectsByUsername } from '../data/getPublicProjects.data';
import { updatePortfolioModeData } from '../data/updatePortfolioMode.data';

// =============================================================================
// Test Data
// =============================================================================

const mockUserId = 'cluser123456789';

const mockUser = {
  id: mockUserId,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: null,
  bio: 'A test bio',
  portfolioMode: 'professional',
};

const mockTimelineData = {
  user: { id: mockUserId, name: 'Test User', username: 'testuser', image: null },
  experiences: [],
  stats: {
    totalXP: 0,
    totalExperiences: 0,
    countByType: { WORK: 0, EDUCATION: 0, PROJECT: 0, CERTIFICATION: 0 },
    milestones: 0,
    achievements: 0,
  },
};

const mockSkillsData = {
  user: { id: mockUserId, name: 'Test User', username: 'testuser', image: null },
  skills: [],
  categories: [],
  groupedByCategory: [],
  stats: { totalSkills: 0, totalXP: 0, masterSkills: 0, categoriesUsed: 0 },
};

const mockProjectExperience = {
  id: 'clexp-project-1',
  userId: mockUserId,
  type: 'PROJECT' as const,
  title: 'Portfolio App',
  company: 'Personal',
  latitude: -34.6037,
  longitude: -58.3816,
  address: 'Buenos Aires, Argentina',
  startDate: new Date('2024-01-01'),
  endDate: null,
  description: 'Built a portfolio app',
  skills: ['TypeScript', 'React'],
  xp: 350,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockWorkExperience = {
  ...mockProjectExperience,
  id: 'clexp-work-1',
  type: 'WORK' as const,
  title: 'Senior Developer',
  company: 'Tech Corp',
  xp: 500,
};

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPortfolioByUsername', () => {
    it('returns aggregated data for a valid username', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(getPublicTimelineByUsername).mockResolvedValue(mockTimelineData as any);
      vi.mocked(getPublicSkillsByUsername).mockResolvedValue(mockSkillsData as any);
      vi.mocked(prisma.experience.findMany).mockResolvedValue([mockProjectExperience]);

      const result = await getPortfolioByUsername('testuser');

      expect(result).not.toBeNull();
      expect(result?.user.username).toBe('testuser');
      expect(result?.user.bio).toBe('A test bio');
      expect(result?.user.portfolioMode).toBe('professional');
      expect(result?.experiences).toEqual(mockTimelineData);
      expect(result?.skills).toEqual(mockSkillsData);
    });

    it('returns null for a non-existent username', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const result = await getPortfolioByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getPublicProjectsByUsername', () => {
    it('returns only experiences with type PROJECT', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserId,
        username: 'testuser',
      } as any);
      vi.mocked(prisma.experience.findMany).mockResolvedValue([mockProjectExperience]);

      const result = await getPublicProjectsByUsername('testuser');

      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].type).toBe('PROJECT');
      expect(prisma.experience.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            type: 'PROJECT',
          },
          orderBy: { startDate: 'desc' },
        })
      );
    });
  });

  describe('updatePortfolioModeData', () => {
    it('correctly updates the portfolioMode field on the User model', async () => {
      const updatedUser = { ...mockUser, portfolioMode: 'gaming' };
      vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as any);

      const result = await updatePortfolioModeData(mockUserId, 'gaming');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { portfolioMode: 'gaming' },
      });
      expect(result.portfolioMode).toBe('gaming');
    });
  });
});
