/**
 * Project i18n Integration Tests (TG8)
 *
 * Verifies that components render translated labels correctly
 * when using the projects and portfolio namespaces.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Override the global next-intl mock with locale-aware translations
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const enTranslations: Record<string, Record<string, string>> = {
      projects: {
        'form.title': 'Title',
        'form.titlePlaceholder': 'Enter project title',
        'form.slug': 'Slug',
        'form.slugPlaceholder': 'project-url-slug',
        'form.shortDescription': 'Short Description',
        'form.shortDescriptionPlaceholder':
          'Brief summary for card previews (max 200 chars)',
        'form.description': 'Description',
        'form.descriptionPlaceholder':
          'Detailed project description (max 5000 chars)',
        'form.imageUpload': 'Cover Image',
        'form.technologies': 'Technologies',
        'form.technologiesPlaceholder': 'Type a technology and press Enter',
        'form.links': 'Links',
        'form.linkType': 'Type',
        'form.linkLabel': 'Label',
        'form.linkLabelPlaceholder': 'Link label',
        'form.linkUrl': 'URL',
        'form.addLink': 'Add Link',
        'form.featured': 'Featured Project',
        'form.status': 'Status',
        'form.startDate': 'Start Date',
        'form.endDate': 'End Date',
        'form.saving': 'Saving...',
        'form.saved': 'Saved',
        'form.cancel': 'Cancel',
        'form.addProject': 'Create Project',
        'form.updateProject': 'Update Project',
        'status.IN_PROGRESS': 'In Progress',
        'status.COMPLETED': 'Completed',
        'status.ARCHIVED': 'Archived',
      },
      portfolio: {
        'sections.projects.classic.title': 'Projects',
        'sections.projects.classic.emptyState': 'No projects yet',
        'sections.projects.classic.featured': 'Featured',
        'sections.projects.tech.title': 'PROJECTS',
        'sections.projects.tech.emptyState': 'NO PROJECTS DEPLOYED',
        'ui.featured': 'Featured',
        'ui.technologies': 'Technologies',
        'ui.links': 'Links',
        'ui.closeModal': 'Close',
        'ui.statusLabels.IN_PROGRESS': 'In Progress',
        'ui.statusLabels.COMPLETED': 'Completed',
        'ui.statusLabels.ARCHIVED': 'Archived',
      },
    };

    return (key: string) => {
      return enTranslations[namespace]?.[key] ?? key;
    };
  },
  useLocale: () => 'en',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="next-image" />
  ),
}));

// Mock server actions
vi.mock('../actions/createProject', () => ({
  createProject: vi.fn().mockResolvedValue({
    hasError: false,
    message: 'Project created successfully',
    payload: { id: 'new-1', title: 'Test' },
  }),
}));

vi.mock('../actions/updateProject', () => ({
  updateProject: vi.fn().mockResolvedValue({
    hasError: false,
    message: 'Project updated successfully',
    payload: { id: 'proj-1', title: 'Updated' },
  }),
}));

vi.mock('../actions/uploadProjectImage', () => ({
  uploadProjectImage: vi.fn(),
}));

vi.mock('../actions/deleteProjectImage', () => ({
  deleteProjectImage: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// =============================================================================
// Test Data
// =============================================================================

const mockUser = {
  id: 'user-1',
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@example.com',
  image: null,
  bio: null,
  portfolioMode: 'classic' as const,
  locale: 'en',
};

const mockProject = {
  id: 'proj-1',
  userId: 'user-1',
  title: 'Test Project',
  slug: 'test-project',
  description: 'A test project description',
  shortDescription: 'Test project',
  imageUrl: null,
  technologies: ['React'],
  links: [],
  featured: false,
  status: 'IN_PROGRESS',
  startDate: new Date('2024-01-01'),
  endDate: null,
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// =============================================================================
// Tests
// =============================================================================

describe('Project i18n Integration (TG8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ProjectForm renders translated labels when locale is EN', async () => {
    const { ProjectForm } = await import('../components/ProjectForm');

    render(<ProjectForm />);

    // Form labels should display English translations, not raw keys
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.getByText('Short Description')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Cover Image')).toBeInTheDocument();
    expect(screen.getByText('Technologies')).toBeInTheDocument();
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Featured Project')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });

  it('ClassicProjects renders translated section title', async () => {
    const { ClassicProjects } = await import(
      '../../portfolio/components/classic/ClassicProjects'
    );

    const mockData = {
      user: mockUser,
      experiences: null,
      skills: null,
      projects: [mockProject] as any,
    };

    render(<ClassicProjects data={mockData} />);

    // Section title should display English translation
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});
