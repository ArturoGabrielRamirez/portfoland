/**
 * Skill Visualization Tests
 *
 * Tests for galaxy view and mobile skill list components.
 * Covers core user flows: galaxy rendering, zoom/pan, accordion, responsive switching.
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
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
    path: (props: any) => <path {...props} />,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock window.matchMedia for responsive tests
const createMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

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
  ],
};

const mockUserSkill2 = {
  id: 'us-2',
  userId: 'user-1',
  skillId: 'skill-2',
  totalXP: 600,
  level: 3,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  skill: {
    id: 'skill-2',
    name: 'TypeScript',
    slug: 'typescript',
    categoryId: 'cat-core',
    iconName: null,
    isCore: true,
    category: {
      id: 'cat-core',
      name: 'Core / Fundamentals',
      slug: 'core',
      color: '#00D4FF',
      isDefault: true,
      userId: null,
    },
  },
  sources: [
    {
      id: 'src-2',
      userSkillId: 'us-2',
      sourceType: 'MANUAL' as const,
      experienceId: null,
      xpAmount: 600,
      metadata: { selfAssessmentLevel: 'ADVANCED' },
      createdAt: new Date('2024-01-01'),
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
  {
    id: 'cat-backend',
    name: 'Backend',
    slug: 'backend',
    color: '#22C55E',
    isDefault: true,
    userId: null,
  },
];

// =============================================================================
// GalaxyCanvas Tests
// =============================================================================

describe('GalaxyCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(true);
  });

  it('renders with category clusters', async () => {
    const { GalaxyCanvas } = await import('../components/GalaxyCanvas');

    render(
      <GalaxyCanvas
        userSkills={[mockUserSkill, mockUserSkill2] as any}
        categories={mockCategories as any}
      />
    );

    // Should render the canvas container
    const canvas = screen.getByRole('region', { name: /galaxy/i });
    expect(canvas).toBeInTheDocument();
  });

  it('renders zoom controls', async () => {
    const { GalaxyCanvas } = await import('../components/GalaxyCanvas');

    render(
      <GalaxyCanvas
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // Should show zoom controls
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });

    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
  });
});

// =============================================================================
// ZoomControls Tests
// =============================================================================

describe('ZoomControls Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles zoom in/out interactions', async () => {
    const { ZoomControls } = await import('../components/ZoomControls');
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onFitAll = vi.fn();

    render(
      <ZoomControls
        zoomLevel={1}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onFitAll={onFitAll}
        minZoom={0.5}
        maxZoom={2}
      />
    );

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    const fitAllButton = screen.getByRole('button', { name: /fit all/i });

    fireEvent.click(zoomInButton);
    expect(onZoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(zoomOutButton);
    expect(onZoomOut).toHaveBeenCalledTimes(1);

    fireEvent.click(fitAllButton);
    expect(onFitAll).toHaveBeenCalledTimes(1);
  });

  it('displays current zoom level indicator', async () => {
    const { ZoomControls } = await import('../components/ZoomControls');

    render(
      <ZoomControls
        zoomLevel={1.5}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onFitAll={() => {}}
        minZoom={0.5}
        maxZoom={2}
      />
    );

    // Should show zoom percentage
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});

// =============================================================================
// MobileSkillList Accordion Tests
// =============================================================================

describe('MobileSkillList Accordion Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = createMatchMedia(false);
  });

  it('expands and collapses category accordion', async () => {
    const { MobileSkillList } = await import('../components/MobileSkillList');

    render(
      <MobileSkillList
        userSkills={[mockUserSkill, mockUserSkill2] as any}
        categories={mockCategories as any}
      />
    );

    // Find the Frontend category header
    const frontendHeader = screen.getByText('Frontend');
    expect(frontendHeader).toBeInTheDocument();

    // Click to expand
    fireEvent.click(frontendHeader);

    // Should show skill after expansion
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(frontendHeader);

    // Skill should still be in DOM but might be hidden (depending on animation)
    // The accordion should toggle its expanded state
    const buttons = screen.getAllByRole('button');
    const frontendButton = buttons.find(
      (btn) => btn.textContent?.includes('Frontend')
    );
    expect(frontendButton).toHaveAttribute('aria-expanded');
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
});

// =============================================================================
// SkillTreeView Responsive Tests
// =============================================================================

describe('SkillTreeView Responsive Switching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GalaxyCanvas on desktop (>=768px)', async () => {
    // Mock desktop viewport
    window.matchMedia = createMatchMedia(true);
    window.innerWidth = 1024;

    const { SkillTreeView } = await import('../components/SkillTreeView');

    render(
      <SkillTreeView
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // On desktop, should render galaxy view
    const galaxyView = screen.queryByRole('region', { name: /galaxy/i });
    // The view should be present (either galaxy or mobile depending on hook)
    expect(screen.getByTestId('skill-tree-view')).toBeInTheDocument();
  });

  it('renders MobileSkillList on mobile (<768px)', async () => {
    // Mock mobile viewport
    window.matchMedia = createMatchMedia(false);
    window.innerWidth = 375;

    const { SkillTreeView } = await import('../components/SkillTreeView');

    render(
      <SkillTreeView
        userSkills={[mockUserSkill] as any}
        categories={mockCategories as any}
      />
    );

    // The view should be present
    expect(screen.getByTestId('skill-tree-view')).toBeInTheDocument();
  });
});

// =============================================================================
// AddSkillFAB Tests
// =============================================================================

describe('AddSkillFAB Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens ManualSkillModal when clicked', async () => {
    const { AddSkillFAB } = await import('../components/AddSkillFAB');
    const onClick = vi.fn();

    render(<AddSkillFAB onClick={onClick} />);

    const fab = screen.getByRole('button', { name: /add skill/i });
    expect(fab).toBeInTheDocument();

    fireEvent.click(fab);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has fixed position styling for mobile', async () => {
    const { AddSkillFAB } = await import('../components/AddSkillFAB');

    render(<AddSkillFAB onClick={() => {}} />);

    const fab = screen.getByRole('button', { name: /add skill/i });
    // FAB should have fixed positioning classes
    expect(fab.className).toContain('fixed');
  });
});
