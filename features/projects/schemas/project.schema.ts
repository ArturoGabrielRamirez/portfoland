/**
 * Project Validation Schemas
 *
 * Yup schemas for validating project data in server actions.
 */

import * as yup from 'yup';
import { PROJECT_LINK_TYPES } from '../types/project';

/**
 * Valid project status values
 */
const projectStatuses = ['IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const;

/**
 * Slug validation regex: lowercase alphanumeric with hyphens
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Link object schema
 */
const linkSchema = yup.object({
  type: yup
    .string()
    .oneOf([...PROJECT_LINK_TYPES], 'Invalid link type')
    .required('Link type is required'),
  label: yup
    .string()
    .max(50, 'Link label must be less than 50 characters')
    .required('Link label is required'),
  url: yup
    .string()
    .url('Link URL must be a valid URL')
    .required('Link URL is required'),
});

/**
 * Schema for creating a new project
 */
export const createProjectSchema = yup.object({
  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  slug: yup
    .string()
    .matches(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .required('Description is required'),
  shortDescription: yup
    .string()
    .max(200, 'Short description must be less than 200 characters')
    .optional()
    .nullable(),
  imageUrl: yup
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .nullable(),
  technologies: yup
    .array()
    .of(yup.string().required())
    .max(15, 'Technologies cannot exceed 15 items')
    .optional()
    .default([]),
  links: yup
    .array()
    .of(linkSchema)
    .optional()
    .default([]),
  featured: yup.boolean().optional().default(false),
  status: yup
    .string()
    .oneOf(projectStatuses, 'Invalid project status')
    .optional()
    .default('IN_PROGRESS'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().nullable().optional(),
  order: yup.number().nullable().optional(),
});

/**
 * Schema for updating an existing project
 * All fields are optional except id
 */
export const updateProjectSchema = yup.object({
  id: yup.string().required('Project ID is required'),
  title: yup
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  slug: yup
    .string()
    .matches(slugRegex, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  shortDescription: yup
    .string()
    .max(200, 'Short description must be less than 200 characters')
    .optional()
    .nullable(),
  imageUrl: yup
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .nullable(),
  technologies: yup
    .array()
    .of(yup.string().required())
    .max(15, 'Technologies cannot exceed 15 items')
    .optional(),
  links: yup
    .array()
    .of(linkSchema)
    .optional(),
  featured: yup.boolean().optional(),
  status: yup
    .string()
    .oneOf(projectStatuses, 'Invalid project status')
    .optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().nullable().optional(),
  order: yup.number().nullable().optional(),
});

/**
 * Schema for deleting a project
 */
export const deleteProjectSchema = yup.object({
  id: yup.string().required('Project ID is required'),
});

/**
 * Inferred types from schemas
 */
export type CreateProjectSchemaInput = yup.InferType<typeof createProjectSchema>;
export type UpdateProjectSchemaInput = yup.InferType<typeof updateProjectSchema>;
export type DeleteProjectSchemaInput = yup.InferType<typeof deleteProjectSchema>;
