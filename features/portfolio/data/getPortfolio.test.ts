
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPortfolioByUsername } from './getPortfolio.data';
import { prisma } from '../../../lib/prisma';
import { getPublicTimelineByUsername } from '@/features/timeline/data/getPublicTimeline.data';
import { getPublicSkillsByUsername } from '@/features/skills/data/getPublicSkills.data';
import { getPublicProjectsByUsername } from './getPublicProjects.data';

// Mock dependencies
vi.mock('../../../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/features/timeline/data/getPublicTimeline.data', () => ({
    getPublicTimelineByUsername: vi.fn(),
}));

vi.mock('@/features/skills/data/getPublicSkills.data', () => ({
    getPublicSkillsByUsername: vi.fn(),
}));

vi.mock('./getPublicProjects.data', () => ({
    getPublicProjectsByUsername: vi.fn(),
}));

describe('getPortfolioByUsername', () => {
    const mockUser = {
        id: 'user-1',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        bio: 'Test Bio',
        portfolioMode: 'gaming',
        locale: 'en',
    };

    const mockExperiences = [
        { id: 'exp-1', title: 'Developer', company: 'Tech Corp' },
    ];

    const mockSkills = [
        { id: 'skill-1', name: 'React', category: 'frontend' },
    ];

    const mockProjects = [
        { id: 'proj-1', title: 'Portfolio', description: 'My portfolio' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return aggregated portfolio data when user exists', async () => {
        // Setup mocks
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);
        (getPublicTimelineByUsername as any).mockResolvedValue(mockExperiences);
        (getPublicSkillsByUsername as any).mockResolvedValue(mockSkills);
        (getPublicProjectsByUsername as any).mockResolvedValue(mockProjects);

        // Execute
        const result = await getPortfolioByUsername('testuser');

        // Verify
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'testuser' },
            select: expect.objectContaining({
                portfolioMode: true,
                bio: true,
                // other fields...
            }),
        });

        expect(result).toEqual({
            user: {
                ...mockUser,
                portfolioMode: 'gaming', // casting check
            },
            experiences: mockExperiences,
            skills: mockSkills,
            projects: mockProjects,
        });
    });

    it('should return null when user does not exist', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const result = await getPortfolioByUsername('nonexistent');

        expect(result).toBeNull();
        expect(getPublicTimelineByUsername).not.toHaveBeenCalled();
    });
});
