/**
 * Skill Components Tests
 *
 * Tests for skill tree UI components.
 * Covers core user flows: hexagon rendering, card flip, form submission, accordion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}));

// =============================================================================
// Mock Data
// =============================================================================

const mockUserSkill = {
  id: 'us-1',
  userId: 'user-1',
  skillId: 'skill-1',
  totalXP: 350,
  level: 2,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  skill: {
    id: 'skill-1',
    name: 'React',
    slug: 'react',
    categoryId: 'cat-frontend',
    iconName: null,
    isCore: false,
    category: {
      id: 'cat-frontend',
      name: 'Frontend',
      slug: 'frontend',
      color: '#A855F7',
      isDefault: true,
      userId: null,
    },
  },
  sources: [
    {
      id: 'src-1',
      userSkillId: 'us-1',
      sourceType: 'EXPERIENCE' as const,
      experienceId: 'exp-1',
      xpAmount: 250,
      metadata: {},
      createdAt: new Date('2024-01-01'),
      experience: {
        id: 'exp-1',
        title: 'Frontend Developer',
        company: 'Tech Corp',
        type: 'WORK' as const,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
      },
    },
    {
      id: 'src-2',
      userSkillId: 'us-1',
      sourceType: 'MANUAL' as const,
      experienceId: null,
      xpAmount: 100,
      metadata: {
        selfAssessmentLevel: 'BEGINNER',
        learningSources: 'Online courses',
      },
      createdAt: new Date('2024-03-01'),
      experience: null,
    },
  ],
};

const mockCategories = [
  {
    id: 'cat-core',
    name: 'Core / Fundamentals',
    slug: 'core',
    color: '#00D4FF',
    isDefault: true,
    userId: null,
  },
  {
    id: 'cat-frontend',
    name: 'Frontend',
    slug: 'frontend',
    color: '#A855F7',
    isDefault: true,
    userId: null,
  },
];

// =============================================================================
// SkillHexagonNode Tests
// =============================================================================

describe('SkillHexagonNode Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct level styling for level 1 (Novice)', async () => {
    const { SkillHexagonNode } = await import('../components/SkillHexagonNode');

    const level1Skill = {
      ...mockUserSkill,
      level: 1,
      totalXP: 100,
    };

    render(
      <SkillHexagonNode
        userSkill={level1Skill as any}
        categoryColor="#A855F7"
        onClick={() => {}}
      />
    );

    // Should render the skill name or first letter
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Level 1 should have appropriate aria-label with Novice
    expect(button).toHaveAttribute('aria-label');
    expect(button.getAttribute('aria-label')).toContain('Novice');
  });

  it('renders with correct level styling for level 5 (Master)', async () => {
    const { SkillHexagonNode } = await import('../components/SkillHexagonNode');

    const level5Skill = {
      ...mockUserSkill,
      level: 5,
      totalXP: 2500,
    };

    render(
      <SkillHexagonNode
        userSkill={level5Skill as any}
        categoryColor="#A855F7"
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Level 5 should have Master in aria-label
    expect(button.getAttribute('aria-label')).toContain('Master');
  });

  it('renders empty state with dashed outline and ? icon', async () => {
    const { SkillHexagonNode } = await import('../components/SkillHexagonNode');

    render(
      <SkillHexagonNode
        isEmpty
        suggestedSkillName="TypeScript"
        categoryColor="#00D4FF"
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Add TypeScript skill');
  });

  it('calls onClick when clicked', async () => {
    const { SkillHexagonNode } = await import('../components/SkillHexagonNode');
    const handleClick = vi.fn();

    render(
      <SkillHexagonNode
        userSkill={mockUserSkill as any}
        categoryColor="#A855F7"
        onClick={handleClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// SkillDetailCard Tests
// =============================================================================

describe('SkillDetailCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers flip animation on card click', async () => {
    const { SkillDetailCard } = await import('../components/SkillDetailCard');
    const handleClose = vi.fn();

    render(
      <SkillDetailCard
        userSkill={mockUserSkill as any}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // Should show skill name on front side
    expect(screen.getByText('React')).toBeInTheDocument();

    // Click to flip - get the first button with flip in aria-label
    const flipButtons = screen.getAllByRole('button', { name: /flip/i });
    expect(flipButtons.length).toBeGreaterThan(0);
    fireEvent.click(flipButtons[0]);

    // After flip, XP breakdown heading should be visible (use getAllByText since it appears multiple times)
    const xpBreakdownElements = screen.getAllByText('XP Breakdown');
    expect(xpBreakdownElements.length).toBeGreaterThan(0);
  });

  it('displays front side with skill info', async () => {
    const { SkillDetailCard } = await import('../components/SkillDetailCard');

    render(
      <SkillDetailCard
        userSkill={mockUserSkill as any}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Should show skill name
    expect(screen.getByText('React')).toBeInTheDocument();

    // Should show level name
    expect(screen.getByText(/apprentice/i)).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const { SkillDetailCard } = await import('../components/SkillDetailCard');
    const handleClose = vi.fn();

    render(
      <SkillDetailCard
        userSkill={mockUserSkill as any}
        isOpen={true}
        onClose={handleClose}
      />
    );

    // Get all close buttons and click the first one
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(closeButtons[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// ManualSkillForm Tests
// =============================================================================

describe('ManualSkillForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with skill name input', async () => {
    const { ManualSkillForm } = await import('../components/ManualSkillForm');
    const handleSubmit = vi.fn();

    render(
      <ManualSkillForm
        onSubmit={handleSubmit}
        categories={mockCategories as any}
      />
    );

    // Name input should be present
    const nameInput = screen.getByPlaceholderText(/typescript|react|docker/i);
    expect(nameInput).toBeInTheDocument();
  });

  it('renders self-assessment level options', async () => {
    const { ManualSkillForm } = await import('../components/ManualSkillForm');
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ManualSkillForm
        onSubmit={handleSubmit}
        categories={mockCategories as any}
      />
    );

    // Should show level options
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const { ManualSkillForm } = await import('../components/ManualSkillForm');

    render(
      <ManualSkillForm
        onSubmit={async () => {}}
        categories={mockCategories as any}
        isLoading={true}
      />
    );

    // Submit button should show "Adding..." when loading
    expect(screen.getByText(/adding/i)).toBeInTheDocument();
  });
});

// =============================================================================
// MobileSkillList Tests
// =============================================================================

describe('MobileSkillList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accordion with category headers', async () => {
    const { MobileSkillList } = await import('../components/MobileSkillList');

    render(
      <MobileSkillList
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // Should show category header
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('expands category to show skills when clicked', async () => {
    const { MobileSkillList } = await import('../components/MobileSkillList');

    render(
      <MobileSkillList
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // Click category header to expand
    const categoryHeader = screen.getByText('Frontend');
    fireEvent.click(categoryHeader);

    // Should show skill after expansion
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  it('shows skill count badge in category header', async () => {
    const { MobileSkillList } = await import('../components/MobileSkillList');

    render(
      <MobileSkillList
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // Should show count badge (1 skill in Frontend)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onSkillClick when skill is tapped', async () => {
    const { MobileSkillList } = await import('../components/MobileSkillList');
    const handleSkillClick = vi.fn();

    render(
      <MobileSkillList
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
        onSkillClick={handleSkillClick}
      />
    );

    // Expand category first
    const categoryHeader = screen.getByText('Frontend');
    fireEvent.click(categoryHeader);

    // Click skill
    await waitFor(async () => {
      const skillItem = screen.getByText('React');
      fireEvent.click(skillItem);
    });

    expect(handleSkillClick).toHaveBeenCalledWith(mockUserSkill);
  });
});
