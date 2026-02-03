/**
 * Timeline Messages Constants
 *
 * User-facing messages for the timeline feature.
 * Centralized for future i18n support.
 */

export const EXPERIENCE_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Experience created successfully',
  UPDATE_SUCCESS: 'Experience updated successfully',
  DELETE_SUCCESS: 'Experience deleted successfully',

  // Error messages
  NOT_FOUND: 'Experience not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  VALIDATION_ERROR: 'Please check your input and try again',
  CREATE_ERROR: 'Failed to create experience',
  UPDATE_ERROR: 'Failed to update experience',
  DELETE_ERROR: 'Failed to delete experience',

  // Auth messages
  LOGIN_REQUIRED: 'Please log in to continue',
} as const;

/**
 * Spanish translations
 */
export const EXPERIENCE_MESSAGES_ES = {
  // Success messages
  CREATE_SUCCESS: 'Experiencia creada exitosamente',
  UPDATE_SUCCESS: 'Experiencia actualizada exitosamente',
  DELETE_SUCCESS: 'Experiencia eliminada exitosamente',

  // Error messages
  NOT_FOUND: 'Experiencia no encontrada',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción',
  VALIDATION_ERROR: 'Por favor verifica los datos e intenta de nuevo',
  CREATE_ERROR: 'Error al crear la experiencia',
  UPDATE_ERROR: 'Error al actualizar la experiencia',
  DELETE_ERROR: 'Error al eliminar la experiencia',

  // Auth messages
  LOGIN_REQUIRED: 'Por favor inicia sesión para continuar',
} as const;

export type ExperienceMessageKey = keyof typeof EXPERIENCE_MESSAGES;
