/**
 * Skill Validation Schemas
 *
 * Yup schemas for validating skill data in server actions.
 */

import * as yup from 'yup';

// =============================================================================
// Field Validators
// =============================================================================

/**
 * Valid self-assessment levels
 */
const selfAssessmentLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

/**
 * Skill name field validator
 */
const skillNameField = yup
  .string()
  .min(1, 'Skill name is required')
  .max(50, 'Skill name must be less than 50 characters')
  .trim();

/**
 * Category ID field validator
 */
const categoryIdField = yup.string().optional();

/**
 * Self-assessment level field validator
 */
const selfAssessmentLevelField = yup
  .string()
  .oneOf(selfAssessmentLevels, 'Invalid self-assessment level');

/**
 * Learning sources field validator
 */
const learningSourcesField = yup
  .string()
  .max(1000, 'Learning sources must be less than 1000 characters')
  .optional();

/**
 * Date started field validator
 */
const dateStartedField = yup.date().nullable().optional();

/**
 * Category name field validator
 */
const categoryNameField = yup
  .string()
  .min(2, 'Category name must be at least 2 characters')
  .max(30, 'Category name must be less than 30 characters')
  .trim();

/**
 * Category color field validator (hex color)
 */
const categoryColorField = yup
  .string()
  .matches(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format. Use hex format (e.g., #FF5733)');

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for creating a new skill
 */
export const createSkillSchema = yup.object({
  name: skillNameField.required('Skill name is required'),
  categoryId: categoryIdField,
  selfAssessmentLevel: selfAssessmentLevelField.required('Self-assessment level is required'),
  learningSources: learningSourcesField,
  dateStarted: dateStartedField,
});

/**
 * Schema for updating an existing skill
 */
export const updateSkillSchema = yup.object({
  id: yup.string().required('Skill ID is required'),
  name: skillNameField.optional(),
  categoryId: categoryIdField,
  selfAssessmentLevel: selfAssessmentLevelField.optional(),
  learningSources: learningSourcesField,
});

/**
 * Schema for deleting a skill
 */
export const deleteSkillSchema = yup.object({
  id: yup.string().required('Skill ID is required'),
});

/**
 * Schema for creating a new category
 */
export const createCategorySchema = yup.object({
  name: categoryNameField.required('Category name is required'),
  color: categoryColorField.required('Category color is required'),
});

/**
 * Schema for manual skill entry (full form)
 * This is the complete schema for the manual skill entry form
 */
export const manualSkillEntrySchema = yup.object({
  name: skillNameField.required('Skill name is required'),
  selfAssessmentLevel: selfAssessmentLevelField.required('Please select your skill level'),
  categoryId: categoryIdField,
  learningSources: learningSourcesField,
  dateStarted: dateStartedField,
});

/**
 * Schema for syncing skills from an experience
 */
export const syncSkillsFromExperienceSchema = yup.object({
  experienceId: yup.string().required('Experience ID is required'),
  userId: yup.string().required('User ID is required'),
  skills: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one skill is required')
    .required('Skills array is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().nullable().optional(),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type CreateSkillSchemaInput = yup.InferType<typeof createSkillSchema>;
export type UpdateSkillSchemaInput = yup.InferType<typeof updateSkillSchema>;
export type DeleteSkillSchemaInput = yup.InferType<typeof deleteSkillSchema>;
export type CreateCategorySchemaInput = yup.InferType<typeof createCategorySchema>;
export type ManualSkillEntrySchemaInput = yup.InferType<typeof manualSkillEntrySchema>;
export type SyncSkillsFromExperienceSchemaInput = yup.InferType<typeof syncSkillsFromExperienceSchema>;
