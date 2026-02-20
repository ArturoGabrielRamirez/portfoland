/**
 * Gallery Messages Constants
 *
 * User-facing messages for the gallery feature.
 * Centralized for future i18n support.
 */

export const GALLERY_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Gallery item created successfully',
  UPDATE_SUCCESS: 'Gallery item updated successfully',
  DELETE_SUCCESS: 'Gallery item deleted successfully',

  // Error messages
  NOT_FOUND: 'Gallery item not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // Auth messages
  LOGIN_REQUIRED: 'Please log in to continue',
} as const;

export type GalleryMessageKey = keyof typeof GALLERY_MESSAGES;
