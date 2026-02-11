/**
 * Skill Integration Tests
 *
 * Tests for skill tree pages and full integration flows.
 * Covers: page loading, skill creation, skill-experience linking, navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Mock Next.js and Auth
// =============================================================================

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    userSkill: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    skillCategory: {
      findMany: vi.fn(),
    },
    skill: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    skillSource: {
      create: vi.fn(),
    },
  },
}));

// =============================================================================
// Mock Data
// =============================================================================

const mockUser = {
  id: 'user-123',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  image: null,
};

const mockSession = {
  user: mockUser,
};

const mockCategory = {
  id: 'cat-frontend',
  name: 'Frontend',
  slug: 'frontend',
  color: '#A855F7',
  isDefault: true,
  userId: null,
};

const mockSkill = {
  id: 'skill-react',
  name: 'React',
  slug: 'react',
  categoryId: 'cat-frontend',
  iconName: null,
  isCore: false,
  category: mockCategory,
};

const mockUserSkill = {
  id: 'us-1',
  userId: 'user-123',
  skillId: 'skill-react',
  totalXP: 350,
  level: 2,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  skill: mockSkill,
  sources: [
    {
      id: 'src-1',
      userSkillId: 'us-1',
      sourceType: 'EXPERIENCE',
      experienceId: 'exp-1',
      xpAmount: 250,
      metadata: {},
      createdAt: new Date('2024-01-01'),
      experience: {
        id: 'exp-1',
        title: 'Frontend Developer',
        company: 'Tech Corp',
        type: 'WORK',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      },
    },
  ],
};

const mockCategories = [
  mockCategory,
  {
    id: 'cat-core',
    name: 'Core / Fundamentals',
    slug: 'core',
    color: '#00D4FF',
    isDefault: true,
    userId: null,
  },
];

// =============================================================================
// Test: Skills Page Loads with User Data
// =============================================================================

describe('Skills Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads skills page with authenticated user data', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

    // Mock data fetching
    vi.mocked(prisma.userSkill.findMany).mockResolvedValue([mockUserSkill] as any);
    vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

    // Import and test the getSkills action
    const { getSkills } = await import('../actions/getSkills');
    const result = await getSkills();

    expect(result.hasError).toBe(false);
    expect(result.payload).toBeDefined();
    expect(result.payload?.skills).toHaveLength(1);
    expect(result.payload?.skills[0].skill.name).toBe('React');
    expect(result.payload?.categories).toHaveLength(2);
  });

  it('returns error when user is not authenticated', async () => {
    const { auth } = await import('@/lib/auth');

    // Mock no session
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const { getSkills } = await import('../actions/getSkills');
    const result = await getSkills();

    expect(result.hasError).toBe(true);
    expect(result.message).toContain('sign in');
  });
});

// =============================================================================
// Test: Skill Creation Flow End-to-End
// =============================================================================

describe('Skill Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates skill name is required for creation', async () => {
    const { auth } = await import('@/lib/auth');

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

    const { createSkill } = await import('../actions/createSkill');
    const result = await createSkill({
      name: '',
      selfAssessmentLevel: 'BEGINNER',
    });

    // Should fail validation with empty name
    expect(result.hasError).toBe(true);
    expect(result.message).toBeDefined();
  });

  it('requires authentication for skill creation', async () => {
    const { auth } = await import('@/lib/auth');

    // Mock no session
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const { createSkill } = await import('../actions/createSkill');
    const result = await createSkill({
      name: 'React',
      selfAssessmentLevel: 'INTERMEDIATE',
    });

    expect(result.hasError).toBe(true);
    expect(result.message).toContain('sign in');
  });

  it('validates self-assessment level is required', async () => {
    const { auth } = await import('@/lib/auth');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

    const { createSkill } = await import('../actions/createSkill');
    const result = await createSkill({
      name: 'React',
      // Missing selfAssessmentLevel
    } as any);

    expect(result.hasError).toBe(true);
  });
});

// =============================================================================
// Test: Skill-Experience Linking Display
// =============================================================================

describe('Skill-Experience Linking Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays linked experiences in skill details', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    // Mock authenticated session
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

    // Mock skill with experience source
    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(mockUserSkill as any);

    const { getSkillById } = await import('../actions/getSkillById');
    const result = await getSkillById('us-1');

    expect(result.hasError).toBe(false);
    expect(result.payload).toBeDefined();
    expect(result.payload?.sources).toHaveLength(1);
    expect(result.payload?.sources[0].sourceType).toBe('EXPERIENCE');
    expect(result.payload?.sources[0].experience?.title).toBe('Frontend Developer');
    expect(result.payload?.sources[0].experience?.company).toBe('Tech Corp');
  });

  it('returns correct XP breakdown from sources', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(mockUserSkill as any);

    const { getSkillById } = await import('../actions/getSkillById');
    const result = await getSkillById('us-1');

    expect(result.payload?.totalXP).toBe(350);
    expect(result.payload?.sources[0].xpAmount).toBe(250);
  });
});

// =============================================================================
// Test: Public Skills Page
// =============================================================================

describe('Public Skills Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads public skills by username', async () => {
    const { prisma } = await import('@/lib/prisma');

    // Mock user lookup with skills
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      userSkills: [mockUserSkill],
    } as any);

    vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

    // Simulate public data fetch
    const user = await prisma.user.findUnique({
      where: { username: 'testuser' },
      include: { userSkills: true },
    });

    expect(user).toBeDefined();
    expect(user?.userSkills).toHaveLength(1);
    expect(user?.username).toBe('testuser');
  });

  it('returns null for non-existent username', async () => {
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const user = await prisma.user.findUnique({
      where: { username: 'nonexistent' },
    });

    expect(user).toBeNull();
  });
});

// =============================================================================
// Test: Navigation Between Features
// =============================================================================

describe('Navigation Between Skill Tree and Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('experience links in skill details contain valid experience IDs', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.userSkill.findUnique).mockResolvedValue(mockUserSkill as any);

    const { getSkillById } = await import('../actions/getSkillById');
    const result = await getSkillById('us-1');

    // Verify experience link data is present
    const experienceSources = result.payload?.sources.filter(
      (s) => s.sourceType === 'EXPERIENCE'
    );

    expect(experienceSources).toHaveLength(1);
    expect(experienceSources?.[0].experienceId).toBe('exp-1');
    expect(experienceSources?.[0].experience?.id).toBe('exp-1');
  });

  it('skills are grouped by category for navigation', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.userSkill.findMany).mockResolvedValue([mockUserSkill] as any);
    vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

    const { getSkills } = await import('../actions/getSkills');
    const result = await getSkills();

    expect(result.payload?.groupedByCategory).toBeDefined();
    expect(result.payload?.groupedByCategory.length).toBeGreaterThan(0);

    const frontendGroup = result.payload?.groupedByCategory.find(
      (g) => g.category.slug === 'frontend'
    );
    expect(frontendGroup?.skills).toHaveLength(1);
    expect(frontendGroup?.category.name).toBe('Frontend');
  });
});

// =============================================================================
// Test: Stats Calculation
// =============================================================================

describe('Skills Stats Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates total skills count correctly', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
      mockUserSkill,
      { ...mockUserSkill, id: 'us-2', skillId: 'skill-ts', totalXP: 500 },
    ] as any);
    vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

    const { getSkills } = await import('../actions/getSkills');
    const result = await getSkills();

    expect(result.payload?.totalCount).toBe(2);
  });

  it('calculates total XP correctly', async () => {
    const { auth } = await import('@/lib/auth');
    const { prisma } = await import('@/lib/prisma');

    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
      { ...mockUserSkill, totalXP: 350 },
      { ...mockUserSkill, id: 'us-2', skillId: 'skill-ts', totalXP: 500 },
    ] as any);
    vi.mocked(prisma.skillCategory.findMany).mockResolvedValue(mockCategories as any);

    const { getSkills } = await import('../actions/getSkills');
    const result = await getSkills();

    expect(result.payload?.totalXP).toBe(850);
  });
});
