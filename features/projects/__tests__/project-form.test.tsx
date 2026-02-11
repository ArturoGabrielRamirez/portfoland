/**
 * ProjectForm Component Tests
 *
 * Tests for the ProjectForm create/edit form.
 * Covers: required field rendering, validation errors on empty submit,
 * edit mode population, and SkillTagInput add/remove.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

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
  uploadProjectImage: vi.fn().mockResolvedValue({
    hasError: false,
    message: 'Image uploaded',
    payload: { url: 'https://blob.example.com/image.png' },
  }),
}));

vi.mock('../actions/deleteProjectImage', () => ({
  deleteProjectImage: vi.fn().mockResolvedValue({
    hasError: false,
    message: 'Image deleted',
    payload: undefined,
  }),
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

const mockProject = {
  id: 'proj-1',
  userId: 'user-1',
  title: 'My Portfolio',
  slug: 'my-portfolio',
  description: 'A full-stack portfolio application with gaming mode',
  shortDescription: 'Portfolio app',
  imageUrl: 'https://blob.example.com/cover.png',
  technologies: ['React', 'TypeScript', 'Next.js'],
  links: [
    { type: 'LIVE', label: 'Live Site', url: 'https://example.com' },
    { type: 'REPO', label: 'GitHub', url: 'https://github.com/user/repo' },
  ],
  featured: true,
  status: 'COMPLETED' as const,
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-06-01'),
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// =============================================================================
// Tests
// =============================================================================

describe('ProjectForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required fields (title, description, startDate, status)', async () => {
    const { ProjectForm } = await import('../components/ProjectForm');

    render(<ProjectForm />);

    // Title field
    expect(screen.getByTestId('title-input')).toBeInTheDocument();

    // Description field
    expect(screen.getByTestId('description-input')).toBeInTheDocument();

    // Start Date field
    expect(screen.getByTestId('start-date-input')).toBeInTheDocument();

    // Status select
    expect(screen.getByTestId('status-select')).toBeInTheDocument();

    // Also check other fields exist
    expect(screen.getByTestId('slug-input')).toBeInTheDocument();
    expect(screen.getByTestId('short-description-input')).toBeInTheDocument();
    expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
    expect(screen.getByTestId('featured-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty required fields', async () => {
    const { ProjectForm } = await import('../components/ProjectForm');

    render(<ProjectForm />);

    // Clear the title field (it defaults to empty)
    const titleInput = screen.getByTestId('title-input');
    await userEvent.clear(titleInput);

    // Clear the description field
    const descriptionInput = screen.getByTestId('description-input');
    await userEvent.clear(descriptionInput);

    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // Wait for validation messages to appear
    await waitFor(() => {
      const errorMessages = document.querySelectorAll('[data-slot="form-message"]');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('populates fields correctly in edit mode when project prop is provided', async () => {
    const { ProjectForm } = await import('../components/ProjectForm');

    render(<ProjectForm project={mockProject as any} />);

    // Title should be populated
    const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
    expect(titleInput.value).toBe('My Portfolio');

    // Slug should be populated
    const slugInput = screen.getByTestId('slug-input') as HTMLInputElement;
    expect(slugInput.value).toBe('my-portfolio');

    // Short description should be populated
    const shortDescInput = screen.getByTestId(
      'short-description-input'
    ) as HTMLInputElement;
    expect(shortDescInput.value).toBe('Portfolio app');

    // Description should be populated
    const descInput = screen.getByTestId(
      'description-input'
    ) as HTMLTextAreaElement;
    expect(descInput.value).toBe(
      'A full-stack portfolio application with gaming mode'
    );

    // Status should be COMPLETED
    const statusSelect = screen.getByTestId(
      'status-select'
    ) as HTMLSelectElement;
    expect(statusSelect.value).toBe('COMPLETED');

    // Featured checkbox should be checked
    const featuredCheckbox = screen.getByTestId(
      'featured-checkbox'
    ) as HTMLInputElement;
    expect(featuredCheckbox.checked).toBe(true);

    // Technologies should be displayed
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();

    // Submit button should say update
    expect(screen.getByTestId('submit-button')).toHaveTextContent(
      'form.updateProject'
    );
  });

  it('technologies SkillTagInput adds and removes tags', async () => {
    const { ProjectForm } = await import('../components/ProjectForm');
    const user = userEvent.setup();

    render(<ProjectForm />);

    // Find the skill tag input (it should be visible since tags array is empty)
    const tagInputs = document.querySelectorAll(
      'input[placeholder="form.technologiesPlaceholder"]'
    );
    expect(tagInputs.length).toBe(1);
    const tagInput = tagInputs[0] as HTMLInputElement;

    // Type a tag and press Enter to add it
    await user.click(tagInput);
    await user.type(tagInput, 'React');
    await user.keyboard('{Enter}');

    // The tag should appear
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Add another tag
    await user.type(tagInput, 'TypeScript');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    // Remove the first tag by clicking its X button
    const removeButtons = document.querySelectorAll(
      '.inline-flex button[type="button"]'
    );
    expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(removeButtons[0]);

    // React tag should be removed
    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    // TypeScript should still be present
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
