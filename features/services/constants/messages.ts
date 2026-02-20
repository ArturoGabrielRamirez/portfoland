/**
 * Service Messages Constants
 *
 * User-facing messages for the services feature.
 * Centralized for future i18n support.
 */

export const SERVICE_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Service created successfully',
  UPDATE_SUCCESS: 'Service updated successfully',
  DELETE_SUCCESS: 'Service deleted successfully',

  // Error messages
  NOT_FOUND: 'Service not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // Auth messages
  LOGIN_REQUIRED: 'Please log in to continue',
} as const;

export type ServiceMessageKey = keyof typeof SERVICE_MESSAGES;
