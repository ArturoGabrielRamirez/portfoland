/**
 * Portfolio Validation Schemas
 *
 * Yup schemas for validating portfolio data in server actions.
 */

import * as yup from 'yup';
import { PORTFOLIO_MODES } from '../constants/messages';

const validModes = [PORTFOLIO_MODES.PROFESSIONAL, PORTFOLIO_MODES.GAMING] as const;

/**
 * Schema for updating portfolio mode
 */
export const updatePortfolioModeSchema = yup.object({
  mode: yup
    .string()
    .oneOf(validModes, 'Invalid portfolio mode')
    .required('Portfolio mode is required'),
});

/**
 * Inferred type from the schema
 */
export type UpdatePortfolioModeInput = yup.InferType<typeof updatePortfolioModeSchema>;

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  bio: yup
    .string()
    .nullable()
    .max(1000, 'Bio must be less than 1000 characters'),
  image: yup
    .string()
    .nullable()
    .url('Image must be a valid URL'),
  sectionOrder: yup.array().of(yup.string().required()).optional(),
  contactLinks: yup.object().optional(),
  sectionVisibility: yup.object().optional(),
});

/**
 * Inferred type from the profile schema
 */
export type UpdateProfileInput = yup.InferType<typeof updateProfileSchema>;
