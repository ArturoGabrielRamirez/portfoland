/**
 * CV Validation Schemas
 *
 * Yup schemas for validating CV data in server actions.
 */

import * as yup from 'yup';

/**
 * Valid CV analysis types
 */
const analysisTypes = [
  'reality_check',
  'ats_optimization',
  'impact_improvement',
  'keyword_gap',
  'weakness_detection',
  'differentiation',
] as const;

/**
 * Schema for generating a new CV
 */
export const generateCVSchema = yup.object({
  targetJob: yup
    .string()
    .max(200, 'Target job must be less than 200 characters')
    .optional()
    .nullable(),
  jobDescription: yup
    .string()
    .max(10000, 'Job description must be less than 10000 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for analyzing a CV
 */
export const analyzeCVSchema = yup.object({
  cvId: yup.string().required('CV ID is required'),
  analysisType: yup
    .string()
    .oneOf([...analysisTypes], 'Invalid analysis type')
    .required('Analysis type is required'),
  jobDescription: yup
    .string()
    .max(10000, 'Job description must be less than 10000 characters')
    .optional()
    .nullable(),
});

/**
 * Schema for deleting a CV
 */
export const deleteCVSchema = yup.object({
  cvId: yup.string().required('CV ID is required'),
});

/**
 * Inferred types from schemas
 */
export type GenerateCVSchemaInput = yup.InferType<typeof generateCVSchema>;
export type AnalyzeCVSchemaInput = yup.InferType<typeof analyzeCVSchema>;
export type DeleteCVSchemaInput = yup.InferType<typeof deleteCVSchema>;
