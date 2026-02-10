/**
 * Gaming Mode Section Tests
 *
 * Tests for the 7 Gaming mode components:
 * - GamingHero renders GamingCard with variant="featured" and GamingAvatar with frame="legendary"
 * - GamingTimeline embeds TimelineMap with isEditable={false}
 * - GamingSkills embeds SkillTreeView with isEditable={false}
 * - GamingProjects renders GamingCard with variant="glow" for each project
 * - GamingAI renders pulsing dot animation and "SYSTEM INITIALIZING..." text
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.about.gaming.title': 'BIOGRAPHY',
      'sections.about.gaming.emptyState': 'BIOGRAPHY DATA NOT FOUND',
      'sections.timeline.gaming.title': 'QUEST LOG',
      'sections.timeline.gaming.emptyState': 'NO MISSIONS LOGGED',
      'sections.skills.gaming.title': 'SKILL TREE',
      'sections.skills.gaming.emptyState': 'NO SKILLS UNLOCKED',
      'sections.projects.gaming.title': 'MISSIONS',
      'sections.projects.gaming.emptyState': 'NO MISSIONS DEPLOYED',
      'sections.contact.gaming.title': 'COMM LINK',
      'sections.ai.gaming.title': 'AI CORE',
      'sections.ai.gaming.description': 'Advanced neural interface.',
      'sections.ai.gaming.status': 'SYSTEM INITIALIZING...',
    };
    return translations[key] ?? key;
  },
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
  portfolioMode: 'gaming' as const,
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
  userSkills: [
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
};

const mockProjects = [
  {
    id: 'proj-1',
    title: 'Cyber Mission',
    description: 'A cyberpunk project',
    startDate: new Date('2023-06-01'),
    endDate: null,
    type: 'PROJECT',
    skills: ['Next.js'],
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

// =============================================================================
// Tests
// =============================================================================

describe('Gaming Mode Section Components', () => {
  it('GamingHero renders GamingCard with variant="featured" and GamingAvatar with frame="legendary"', async () => {
    const { GamingHero } = await import('../components/gaming/GamingHero');

    const { container } = render(<GamingHero data={mockData} />);

    // GamingCard with featured variant (CVA resolves to gradient bg)
    const heroCard = screen.getByTestId('gaming-hero-card');
    expect(heroCard).toBeInTheDocument();
    expect(heroCard.className).toContain('bg-gradient-to-br');

    // GamingAvatar with legendary frame (gold border from CVA resolution)
    const avatar = container.querySelector('[class*="ring-2"]');
    expect(avatar).toBeInTheDocument();

    // User name displayed
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe');
  });

  it('GamingTimeline embeds TimelineMap with isEditable={false}', async () => {
    const { GamingTimeline } = await import('../components/gaming/GamingTimeline');

    render(<GamingTimeline data={mockData} />);

    const timelineMap = screen.getByTestId('timeline-map');
    expect(timelineMap).toBeInTheDocument();
    expect(timelineMap).toHaveAttribute('data-editable', 'false');
  });

  it('GamingSkills embeds SkillTreeView with isEditable={false}', async () => {
    const { GamingSkills } = await import('../components/gaming/GamingSkills');

    render(<GamingSkills data={mockData} />);

    const skillTree = screen.getByTestId('skill-tree-view');
    expect(skillTree).toBeInTheDocument();
    expect(skillTree).toHaveAttribute('data-editable', 'false');
  });

  it('GamingProjects renders GamingCard with variant="glow" for each project', async () => {
    const { GamingProjects } = await import('../components/gaming/GamingProjects');

    render(<GamingProjects data={mockData} />);

    const projectCards = screen.getAllByTestId('gaming-project-card');
    expect(projectCards.length).toBe(1);

    // Check glow variant class (CVA resolves to actual CSS classes with cyan border)
    expect(projectCards[0].className).toContain('border-[#00D4FF]');

    // Project title
    expect(screen.getByText('Cyber Mission')).toBeInTheDocument();
  });

  it('GamingAI renders pulsing dot animation and "SYSTEM INITIALIZING..." text', async () => {
    const { GamingAI } = await import('../components/gaming/GamingAI');

    render(<GamingAI data={mockData} />);

    // Pulsing dot
    const pulsingDot = screen.getByTestId('pulsing-dot');
    expect(pulsingDot).toBeInTheDocument();
    expect(pulsingDot.className).toContain('animate-pulse');

    // System initializing text
    const statusText = screen.getByTestId('system-initializing');
    expect(statusText).toHaveTextContent('SYSTEM INITIALIZING...');
  });
});
