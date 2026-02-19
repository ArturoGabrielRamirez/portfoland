/**
 * Classic Mode Section Tests
 *
 * Tests for the 7 Classic mode components:
 * - ClassicHero renders user name in h1, avatar with initials fallback
 * - ClassicTimeline renders as semantic ordered list with time elements
 * - ClassicSkills renders skills grouped by category with progress bars
 * - ClassicProjects renders project cards using shadcn Card
 * - ClassicAbout shows empty state when bio is empty
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.about.classic.title': 'About',
      'sections.about.classic.emptyState': 'No summary provided',
      'sections.timeline.classic.title': 'Experience',
      'sections.timeline.classic.emptyState': 'No experience added yet',
      'sections.skills.classic.title': 'Skills',
      'sections.skills.classic.emptyState': 'No skills listed yet',
      'sections.projects.classic.title': 'Projects',
      'sections.projects.classic.emptyState': 'No projects yet',
      'sections.projects.classic.featured': 'Featured',
      'sections.contact.classic.title': 'Contact',
      'sections.ai.classic.title': 'AI-Powered Insights',
      'sections.ai.classic.description': 'Intelligent analysis powered by AI.',
      'sections.ai.classic.comingSoon': 'Coming Soon',
    };
    return translations[key] ?? key;
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// =============================================================================
// Test Data
// =============================================================================

const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  image: null,
  bio: null,
  portfolioMode: 'classic' as const,
  locale: 'en',
};

const mockExperiences = {
  experiences: [
    {
      id: 'exp-1',
      title: 'Senior Developer',
      company: 'TechCorp',
      description: 'Built amazing things',
      startDate: new Date('2022-01-01'),
      endDate: null,
      type: 'WORK',
      skills: ['React', 'TypeScript'],
      userId: 'user-1',
      xp: 100,
      latitude: 0,
      longitude: 0,
      address: 'Remote',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  stats: {
    totalXP: 100,
    totalExperiences: 1,
    countByType: { WORK: 1, EDUCATION: 0, PROJECT: 0, CERTIFICATION: 0 },
    milestones: 0,
    achievements: 0,
  },
  user: { id: 'user-1', name: 'John Doe', username: 'johndoe', image: null },
};

const mockSkills = {
  user: { id: 'user-1', name: 'John Doe', username: 'johndoe', image: null },
  skills: [
    {
      id: 'us-1',
      level: 4,
      totalXP: 800,
      currentXP: 800,
      skill: {
        id: 'skill-1',
        name: 'React',
        category: { id: 'cat-1', name: 'Frontend', color: '#3B82F6' },
        categoryId: 'cat-1',
      },
      userId: 'user-1',
      skillId: 'skill-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'us-2',
      level: 3,
      totalXP: 500,
      currentXP: 500,
      skill: {
        id: 'skill-2',
        name: 'Node.js',
        category: { id: 'cat-2', name: 'Backend', color: '#22C55E' },
        categoryId: 'cat-2',
      },
      userId: 'user-1',
      skillId: 'skill-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  categories: [],
  groupedByCategory: [],
  stats: { totalSkills: 2, totalXP: 1300, masterSkills: 0, categoriesUsed: 2 },
};

const mockProjects = [
  {
    id: 'proj-1',
    userId: 'user-1',
    title: 'Portfolio App',
    slug: 'portfolio-app',
    description: 'A portfolio application',
    shortDescription: null,
    imageUrl: null,
    technologies: ['Next.js', 'Tailwind'],
    links: [],
    featured: false,
    status: 'COMPLETED',
    startDate: new Date('2023-06-01'),
    endDate: null,
    order: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockData: PortfolioData = {
  user: mockUser,
  experiences: mockExperiences as any,
  skills: mockSkills as any,
  projects: mockProjects as any,
};

const emptyData: PortfolioData = {
  user: { ...mockUser, bio: null },
  experiences: null,
  skills: null,
  projects: [],
};

// =============================================================================
// Tests
// =============================================================================

describe('Classic Mode Section Components', () => {
  it('ClassicHero renders user name in h1 and avatar with initials fallback', async () => {
    const { ClassicHero } = await import(
      '../components/classic/ClassicHero'
    );

    render(<ClassicHero data={mockData} />);

    // Name in h1
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('John Doe');

    // Avatar with initials fallback (image is null)
    const initials = screen.getByTestId('avatar-initials');
    expect(initials).toHaveTextContent('JD');
  });

  it('ClassicTimeline renders experiences as semantic ordered list with time elements', async () => {
    const { ClassicTimeline } = await import(
      '../components/classic/ClassicTimeline'
    );

    render(<ClassicTimeline data={mockData} />);

    // Semantic ordered list
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');

    // List items
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBe(1);

    // Time elements
    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBeGreaterThan(0);

    // Heading hierarchy
    const h3 = screen.getByRole('heading', { level: 3 });
    expect(h3).toHaveTextContent('Senior Developer');
  });

  it('ClassicSkills renders skills grouped by category with progress bars', async () => {
    const { ClassicSkills } = await import(
      '../components/classic/ClassicSkills'
    );

    render(<ClassicSkills data={mockData} />);

    // Skills grid exists
    expect(screen.getByTestId('skills-grid')).toBeInTheDocument();

    // Category dots
    const dots = screen.getAllByTestId('category-dot');
    expect(dots.length).toBe(2); // Frontend, Backend

    // Progress bars
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(2);

    // Skill names
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('ClassicProjects renders project cards using shadcn Card', async () => {
    const { ClassicProjects } = await import(
      '../components/classic/ClassicProjects'
    );

    render(<ClassicProjects data={mockData} />);

    // Project cards (using data-slot="card" from shadcn)
    const cards = screen.getAllByTestId('project-card');
    expect(cards.length).toBe(1);

    // Project title
    expect(screen.getByText('Portfolio App')).toBeInTheDocument();

    // Technology badges
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Tailwind')).toBeInTheDocument();
  });

  it('ClassicAbout shows empty state message when bio is empty', async () => {
    const { ClassicAbout } = await import(
      '../components/classic/ClassicAbout'
    );

    render(<ClassicAbout data={emptyData} />);

    // Empty state message
    const emptyState = screen.getByTestId('about-empty-state');
    expect(emptyState).toHaveTextContent('No summary provided');
  });
});
