/**
 * Project Model and Schema Validation Tests
 *
 * Tests for the Project model types and Yup validation schemas.
 * Covers: required field validation, links structure, technologies max length,
 * and slug format validation.
 */

import { describe, it, expect } from 'vitest';
import { createProjectSchema } from '../schemas/project.schema';

// =============================================================================
// createProjectSchema Validation Tests
// =============================================================================

describe('createProjectSchema', () => {
  const validInput = {
    title: 'My Portfolio App',
    description: 'A full-stack portfolio application built with Next.js and TypeScript',
    startDate: new Date('2024-01-15'),
  };

  it('validates required fields (title, description, startDate)', async () => {
    // Valid input should pass
    await expect(createProjectSchema.validate(validInput)).resolves.toBeDefined();

    // Missing title should fail
    await expect(
      createProjectSchema.validate({ ...validInput, title: undefined })
    ).rejects.toThrow('Title is required');

    // Missing description should fail
    await expect(
      createProjectSchema.validate({ ...validInput, description: undefined })
    ).rejects.toThrow('Description is required');

    // Missing startDate should fail
    await expect(
      createProjectSchema.validate({ ...validInput, startDate: undefined })
    ).rejects.toThrow('Start date is required');
  });

  it('validates links array structure ({ type, label, url })', async () => {
    // Valid links should pass
    const inputWithLinks = {
      ...validInput,
      links: [
        { type: 'LIVE', label: 'Live Site', url: 'https://example.com' },
        { type: 'REPO', label: 'GitHub', url: 'https://github.com/user/repo' },
      ],
    };
    const result = await createProjectSchema.validate(inputWithLinks);
    expect(result.links).toHaveLength(2);
    expect(result.links![0]).toEqual({
      type: 'LIVE',
      label: 'Live Site',
      url: 'https://example.com',
    });

    // Invalid link type should fail
    await expect(
      createProjectSchema.validate({
        ...validInput,
        links: [{ type: 'INVALID', label: 'Test', url: 'https://example.com' }],
      })
    ).rejects.toThrow('Invalid link type');

    // Invalid URL format should fail
    await expect(
      createProjectSchema.validate({
        ...validInput,
        links: [{ type: 'LIVE', label: 'Test', url: 'not-a-url' }],
      })
    ).rejects.toThrow();
  });

  it('validates technologies array max length (15 items)', async () => {
    // 15 items should pass
    const fifteenTechs = Array.from({ length: 15 }, (_, i) => `Tech${i}`);
    await expect(
      createProjectSchema.validate({ ...validInput, technologies: fifteenTechs })
    ).resolves.toBeDefined();

    // 16 items should fail
    const sixteenTechs = Array.from({ length: 16 }, (_, i) => `Tech${i}`);
    await expect(
      createProjectSchema.validate({ ...validInput, technologies: sixteenTechs })
    ).rejects.toThrow('Technologies cannot exceed 15 items');
  });
});

// =============================================================================
// Slug Validation Tests
// =============================================================================

describe('slug validation', () => {
  const validInput = {
    title: 'My Project',
    description: 'A project description that is long enough to pass validation',
    startDate: new Date('2024-01-15'),
  };

  it('accepts lowercase alphanumeric with hyphens, rejects invalid characters', async () => {
    // Valid slugs should pass
    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'my-project' })
    ).resolves.toBeDefined();

    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'project123' })
    ).resolves.toBeDefined();

    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'my-cool-project-2024' })
    ).resolves.toBeDefined();

    // Uppercase should fail
    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'My-Project' })
    ).rejects.toThrow('Slug must contain only lowercase letters, numbers, and hyphens');

    // Spaces should fail
    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'my project' })
    ).rejects.toThrow('Slug must contain only lowercase letters, numbers, and hyphens');

    // Special characters should fail
    await expect(
      createProjectSchema.validate({ ...validInput, slug: 'my_project!' })
    ).rejects.toThrow('Slug must contain only lowercase letters, numbers, and hyphens');
  });
});
