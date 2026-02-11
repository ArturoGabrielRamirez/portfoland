/**
 * Reusable field validators for authentication forms
 *
 * These base validators can be composed into multiple schemas
 * for login, registration, and other auth-related forms.
 */
import * as yup from 'yup';

/**
 * Email field validator
 * - Trims whitespace
 * - Converts to lowercase
 * - Validates email format
 */
export const emailField = yup
  .string()
  .email('Invalid email address')
  .lowercase()
  .trim();

/**
 * Name field validator
 * - Trims whitespace
 * - Minimum 2 characters
 * - Maximum 100 characters
 */
export const nameField = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .trim();

/**
 * Password field validator
 * - Minimum 8 characters for security
 */
export const passwordField = yup
  .string()
  .min(8, 'Password must be at least 8 characters');
