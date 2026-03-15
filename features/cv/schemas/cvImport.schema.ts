/**
 * CV Import Validation Schemas
 *
 * Zod schema for AI extraction from uploaded CV files,
 * and Yup schema for validating confirmed items in the server action.
 */

import { z } from 'zod';
import * as yup from 'yup';

// =============================================================================
// Zod Schema — used with generateObject for AI extraction
// =============================================================================

/**
 * Schema for AI-extracted CV data from uploaded PDF/DOCX files
 */
export const CVImportSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.number().int().min(1).max(5),
        category: z.string(),
      })
    )
    .max(30),
  experiences: z
    .array(
      z.object({
        type: z.enum(['WORK', 'EDUCATION', 'CERTIFICATION']),
        title: z.string(),
        company: z.string(),
        startDate: z.string().describe('ISO date string YYYY-MM-DD'),
        endDate: z.string().optional().nullable(),
        description: z.string().max(1500),
      })
    )
    .max(20),
  projects: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().max(600),
        technologies: z.array(z.string()).max(10),
      })
    )
    .max(10),
  summary: z.string().optional(),
});

export type CVImportSchemaOutput = z.infer<typeof CVImportSchema>;

// =============================================================================
// Yup Schema — used with actionWrapper for server action validation
// =============================================================================

const skillItemSchema = yup.object({
  name: yup.string().required(),
  level: yup.number().integer().min(1).max(5).required(),
  category: yup.string().required(),
});

const experienceItemSchema = yup.object({
  type: yup
    .string()
    .oneOf(['WORK', 'EDUCATION', 'CERTIFICATION'] as const)
    .required(),
  title: yup.string().required(),
  company: yup.string().required(),
  startDate: yup.string().required(),
  endDate: yup.string().nullable().optional(),
  description: yup.string().max(1500).required(),
});

const projectItemSchema = yup.object({
  title: yup.string().required(),
  description: yup.string().max(600).required(),
  technologies: yup.array(yup.string().required()).required(),
});

/**
 * Schema validating the confirmed subset of CV items sent by the client
 * All three arrays are optional — user may uncheck all items in a group
 */
export const confirmCVImportSchema = yup.object({
  skills: yup.array(skillItemSchema).optional().default([]),
  experiences: yup.array(experienceItemSchema).optional().default([]),
  projects: yup.array(projectItemSchema).optional().default([]),
});

export type ConfirmCVImportInput = yup.InferType<typeof confirmCVImportSchema>;
