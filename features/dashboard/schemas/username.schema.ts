/**
 * Username Validation Schema
 *
 * Yup schema for validating usernames in dashboard settings.
 * Enforces format rules and rejects reserved subdomain names
 * to prevent conflicts with subdomain routing.
 */

import * as yup from 'yup';

import { isReservedSubdomain } from '@/features/core';

// =============================================================================
// Field Validators
// =============================================================================

/**
 * Username field validator
 *
 * Rules:
 * - Required
 * - 3-30 characters
 * - Lowercase alphanumeric and hyphens only
 * - No leading or trailing hyphens
 * - Not a reserved subdomain name
 */
const usernameField = yup
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .matches(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Username must be lowercase, alphanumeric, and may contain hyphens (no leading or trailing hyphens)'
  )
  .test(
    'reserved',
    'This username is reserved and cannot be used',
    (value) => {
      if (!value) return true;
      return !isReservedSubdomain(value);
    }
  );

// =============================================================================
// Schemas
// =============================================================================

/**
 * Schema for setting or updating a username
 */
export const usernameSchema = yup.object({
  username: usernameField.required('Username is required'),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type UsernameSchemaInput = yup.InferType<typeof usernameSchema>;
