/**
 * Project Messages Constants
 *
 * User-facing messages for the projects feature.
 * Centralized for future i18n support.
 */

export const PROJECT_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Project created successfully',
  UPDATE_SUCCESS: 'Project updated successfully',
  DELETE_SUCCESS: 'Project deleted successfully',

  // Error messages
  NOT_FOUND: 'Project not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // Auth messages
  LOGIN_REQUIRED: 'Please log in to continue',

  // Image upload messages
  UPLOAD_SUCCESS: 'Image uploaded successfully',
  UPLOAD_ERROR: 'Failed to upload image',
  UPLOAD_TYPE_ERROR: 'Invalid file type. Please upload a PNG, JPG, or WEBP image',
  UPLOAD_SIZE_ERROR: 'File size exceeds 5MB limit',
  DELETE_IMAGE_SUCCESS: 'Image deleted successfully',
  DELETE_IMAGE_ERROR: 'Failed to delete image',
} as const;

export type ProjectMessageKey = keyof typeof PROJECT_MESSAGES;
