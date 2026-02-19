/**
 * Tech Mode Section Tests
 *
 * Tests for the 7 Tech mode components:
 * - TechHero renders TechCard with variant="featured" and TechAvatar with frame="legendary"
 * - TechTimeline embeds TimelineMap with isEditable={false}
 * - TechSkills embeds SkillTreeView with isEditable={false}
 * - TechProjects renders TechCard with variant="glow" for each project
 * - TechAI renders pulsing dot animation and "SYSTEM INITIALIZING..." text
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.about.tech.title': 'BIOGRAPHY',
      'sections.about.tech.emptyState': 'BIOGRAPHY DATA NOT FOUND',
      'sections.timeline.tech.title': 'WORK LOG',
      'sections.timeline.tech.emptyState': 'NO EXPERIENCE LOGGED',
      'sections.skills.tech.title': 'SKILL TREE',
      'sections.skills.tech.emptyState': 'NO SKILLS UNLOCKED',
      'sections.projects.tech.title': 'PROJECTS',
      'sections.projects.tech.emptyState': 'NO PROJECTS DEPLOYED',
      'sections.contact.tech.title': 'COMM LINK',
      'sections.ai.tech.title': 'AI CORE',
      'sections.ai.tech.description': 'Advanced neural interface.',
      'sections.ai.tech.status': 'SYSTEM INITIALIZING...',
    };
    return translations[key] ?? key;
  },
  useLocale: () => 'en',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock TimelineMap
vi.mock('@/features/timeline/components', () => ({
  TimelineMap: (props: any) => (
    <div data-testid="timeline-map" data-editable={props.isEditable?.toString()}>
      TimelineMap
    </div>
  ),
}));

// Mock SkillTreeView
vi.mock('@/features/skills/components', () => ({
  SkillTreeView: (props: any) => (
    <div data-testid="skill-tree-view" data-editable={props.isEditable?.toString()}>
      SkillTreeView
    </div>
  ),
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
  bio: 'A developer',
  portfolioMode: 'tech' as const,
  locale: 'en',
  sectionOrder: [],
  contactLinks: {},
  sectionVisibility: {},
};

const mockExperiences = {
  experiences: [
    {
      id: 'exp-1',
      title: 'Quest Master',
      company: 'TechGuild',
      description: 'Led epic quests',
      startDate: new Date('2022-01-01'),
      endDate: null,
      type: 'WORK',
      skills: ['React'],
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
        category: { id: 'cat-1', name: 'Frontend', color: '#00D4FF' },
        categoryId: 'cat-1',
      },
      userId: 'user-1',
      skillId: 'skill-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  categories: [{ id: 'cat-1', name: 'Frontend', color: '#00D4FF' }],
  groupedByCategory: [],
  stats: { totalSkills: 1, totalXP: 800, masterSkills: 0, categoriesUsed: 1 },
};

const mockProjects = [
  {
    id: 'proj-1',
    userId: 'user-1',
    title: 'Cyber Mission',
    slug: 'cyber-mission',
    description: 'A cyberpunk project',
    shortDescription: null,
    imageUrl: null,
    technologies: ['Next.js'],
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

// =============================================================================
// Tests
// =============================================================================

describe('Tech Mode Section Components', () => {
  it('TechHero renders TechCard with variant="featured" and TechAvatar with frame="legendary"', async () => {
    const { TechHero } = await import('../components/tech/TechHero');

    const { container } = render(<TechHero data={mockData} />);

    // TechCard with featured variant (CVA resolves to gradient bg)
    const heroCard = screen.getByTestId('tech-hero-card');
    expect(heroCard).toBeInTheDocument();
    expect(heroCard.className).toContain('bg-gradient-to-br');

    // TechAvatar with legendary frame (gold border from CVA resolution)
    const avatar = container.querySelector('[class*="ring-2"]');
    expect(avatar).toBeInTheDocument();

    // User name displayed
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
  });

  it('TechTimeline embeds TimelineMap with isEditable={false}', async () => {
    const { TechTimeline } = await import('../components/tech/TechTimeline');

    render(<TechTimeline data={mockData} />);

    const timelineMap = screen.getByTestId('timeline-map');
    expect(timelineMap).toBeInTheDocument();
    expect(timelineMap).toHaveAttribute('data-editable', 'false');
  });

  it('TechSkills embeds SkillTreeView with isEditable={false}', async () => {
    const { TechSkills } = await import('../components/tech/TechSkills');

    render(<TechSkills data={mockData} />);

    const skillTree = screen.getByTestId('skill-tree-view');
    expect(skillTree).toBeInTheDocument();
    expect(skillTree).toHaveAttribute('data-editable', 'false');
  });

  it('TechProjects renders TechCard with variant="glow" for each project', async () => {
    const { TechProjects } = await import('../components/tech/TechProjects');

    render(<TechProjects data={mockData} />);

    const projectCards = screen.getAllByTestId('tech-project-card');
    expect(projectCards.length).toBe(1);

    // Check glow variant class (CVA resolves to actual CSS classes with cyan border)
    expect(projectCards[0].className).toContain('border-[#00D4FF]');

    // Project title
    expect(screen.getByText('Cyber Mission')).toBeInTheDocument();
  });

  it('TechAI renders pulsing dot animation and "Initializing AI system..." text', async () => {
    const { TechAI } = await import('../components/tech/TechAI');

    render(<TechAI data={mockData} />);

    // Pulsing dot
    const pulsingDot = screen.getByTestId('pulsing-dot');
    expect(pulsingDot).toBeInTheDocument();
    expect(pulsingDot.className).toContain('animate-pulse');

    // System initializing text
    const statusText = screen.getByTestId('system-initializing');
    expect(statusText).toHaveTextContent('Initializing AI system...');
  });
});
