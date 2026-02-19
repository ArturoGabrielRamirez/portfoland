/**
 * Portfolio Project Card Tests (TG6)
 *
 * Tests for Classic and Tech project card components
 * with the new Project model data shape.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { PortfolioData } from '../types/portfolio';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'sections.projects.classic.title': 'Projects',
      'sections.projects.classic.emptyState': 'No projects yet',
      'sections.projects.classic.featured': 'Featured',
      'sections.projects.tech.title': 'PROJECTS',
      'sections.projects.tech.emptyState': 'NO PROJECTS DEPLOYED',
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

const mockFeaturedProject = {
  id: 'proj-1',
  userId: 'user-1',
  title: 'Featured Project',
  slug: 'featured-project',
  description: 'A featured project description',
  shortDescription: 'Short featured desc',
  imageUrl: 'https://example.com/image.jpg',
  technologies: ['React', 'TypeScript'],
  links: [
    { type: 'LIVE', label: 'Live Site', url: 'https://example.com' },
    { type: 'REPO', label: 'GitHub', url: 'https://github.com/example' },
  ],
  featured: true,
  status: 'COMPLETED',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-12-01'),
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStandardProject = {
  id: 'proj-2',
  userId: 'user-1',
  title: 'Standard Project',
  slug: 'standard-project',
  description: 'A standard project description',
  shortDescription: 'Short standard desc',
  imageUrl: null,
  technologies: ['Next.js', 'Tailwind'],
  links: [
    { type: 'REPO', label: 'Source Code', url: 'https://github.com/example2' },
  ],
  featured: false,
  status: 'IN_PROGRESS',
  startDate: new Date('2024-01-01'),
  endDate: null,
  order: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProjects = [mockFeaturedProject, mockStandardProject];

const mockData: PortfolioData = {
  user: mockUser,
  experiences: null,
  skills: null,
  projects: mockProjects as any,
};

// =============================================================================
// Tests
// =============================================================================

describe('Portfolio Project Card Components (TG6)', () => {
  it('ClassicProjects renders project cards with title, description, and technology badges', async () => {
    const { ClassicProjects } = await import(
      '../components/classic/ClassicProjects'
    );

    render(<ClassicProjects data={mockData} />);

    // Project cards rendered
    const cards = screen.getAllByTestId('project-card');
    expect(cards.length).toBe(2);

    // Titles
    expect(screen.getByText('Featured Project')).toBeInTheDocument();
    expect(screen.getByText('Standard Project')).toBeInTheDocument();

    // Short descriptions
    expect(screen.getByText('Short featured desc')).toBeInTheDocument();
    expect(screen.getByText('Short standard desc')).toBeInTheDocument();

    // Technology badges
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Tailwind')).toBeInTheDocument();
  });

  it('ClassicProjects renders featured projects first with featured indicator', async () => {
    const { ClassicProjects } = await import(
      '../components/classic/ClassicProjects'
    );

    render(<ClassicProjects data={mockData} />);

    // Featured indicator present
    const featuredBadge = screen.getByTestId('featured-indicator');
    expect(featuredBadge).toBeInTheDocument();

    // The first card should be the featured one (border-l-4 border-blue-600 class)
    const cards = screen.getAllByTestId('project-card');
    expect(cards[0].className).toContain('border-l-4');
    expect(cards[0].className).toContain('border-blue-600');
  });

  it('TechProjects renders TechCard with variant="featured" for featured projects', async () => {
    const { TechProjects } = await import(
      '../components/tech/TechProjects'
    );

    render(<TechProjects data={mockData} />);

    const projectCards = screen.getAllByTestId('tech-project-card');
    expect(projectCards.length).toBe(2);

    // Featured card uses variant="featured" (CVA resolves to gradient bg)
    expect(projectCards[0].className).toContain('bg-gradient-to-br');

    // Standard card uses variant="glow" (CVA resolves to cyan border)
    expect(projectCards[1].className).toContain('border-[#00D4FF]');
  });

  it('TechProjects renders StatCard with correct project count', async () => {
    const { TechProjects } = await import(
      '../components/tech/TechProjects'
    );

    render(<TechProjects data={mockData} />);

    // StatCard shows project count
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
