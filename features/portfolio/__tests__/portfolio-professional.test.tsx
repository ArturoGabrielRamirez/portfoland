/**
 * Professional Mode Section Tests
 *
 * Tests for the 7 Professional mode components:
 * - ProfessionalHero renders user name in h1, avatar with initials fallback
 * - ProfessionalTimeline renders as semantic ordered list with time elements
 * - ProfessionalSkills renders skills grouped by category with progress bars
 * - ProfessionalProjects renders project cards using shadcn Card
 * - ProfessionalAbout shows empty state when bio is empty
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.about.professional.title': 'About',
      'sections.about.professional.emptyState': 'No summary provided',
      'sections.timeline.professional.title': 'Experience',
      'sections.timeline.professional.emptyState': 'No experience added yet',
      'sections.skills.professional.title': 'Skills',
      'sections.skills.professional.emptyState': 'No skills listed yet',
      'sections.projects.professional.title': 'Projects',
      'sections.projects.professional.emptyState': 'No projects yet',
      'sections.contact.professional.title': 'Contact',
      'sections.ai.professional.title': 'AI-Powered Insights',
      'sections.ai.professional.description': 'Intelligent analysis powered by AI.',
      'sections.ai.professional.comingSoon': 'Coming Soon',
    };
    return translations[key] ?? key;
  },
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
  portfolioMode: 'professional' as const,
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
  userSkills: [
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
};

const mockProjects = [
  {
    id: 'proj-1',
    title: 'Portfolio App',
    description: 'A portfolio application',
    startDate: new Date('2023-06-01'),
    endDate: null,
    type: 'PROJECT',
    skills: ['Next.js', 'Tailwind'],
    userId: 'user-1',
    company: 'Personal',
    xp: 50,
    latitude: 0,
    longitude: 0,
    address: '',
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

describe('Professional Mode Section Components', () => {
  it('ProfessionalHero renders user name in h1 and avatar with initials fallback', async () => {
    const { ProfessionalHero } = await import(
      '../components/professional/ProfessionalHero'
    );

    render(<ProfessionalHero data={mockData} />);

    // Name in h1
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('John Doe');

    // Avatar with initials fallback (image is null)
    const initials = screen.getByTestId('avatar-initials');
    expect(initials).toHaveTextContent('JD');
  });

  it('ProfessionalTimeline renders experiences as semantic ordered list with time elements', async () => {
    const { ProfessionalTimeline } = await import(
      '../components/professional/ProfessionalTimeline'
    );

    render(<ProfessionalTimeline data={mockData} />);

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

  it('ProfessionalSkills renders skills grouped by category with progress bars', async () => {
    const { ProfessionalSkills } = await import(
      '../components/professional/ProfessionalSkills'
    );

    render(<ProfessionalSkills data={mockData} />);

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

  it('ProfessionalProjects renders project cards using shadcn Card', async () => {
    const { ProfessionalProjects } = await import(
      '../components/professional/ProfessionalProjects'
    );

    render(<ProfessionalProjects data={mockData} />);

    // Project cards (using data-slot="card" from shadcn)
    const cards = screen.getAllByTestId('project-card');
    expect(cards.length).toBe(1);

    // Project title
    expect(screen.getByText('Portfolio App')).toBeInTheDocument();

    // Skill tags
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Tailwind')).toBeInTheDocument();
  });

  it('ProfessionalAbout shows empty state message when bio is empty', async () => {
    const { ProfessionalAbout } = await import(
      '../components/professional/ProfessionalAbout'
    );

    render(<ProfessionalAbout data={emptyData} />);

    // Empty state message
    const emptyState = screen.getByTestId('about-empty-state');
    expect(emptyState).toHaveTextContent('No summary provided');
  });
});
