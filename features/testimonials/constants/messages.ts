/**
 * Testimonial Messages Constants
 *
 * User-facing messages for the testimonials feature.
 * Centralized for future i18n support.
 */

export const TESTIMONIAL_MESSAGES = {
  // Success messages
  CREATE_SUCCESS: 'Testimonial created successfully',
  UPDATE_SUCCESS: 'Testimonial updated successfully',
  DELETE_SUCCESS: 'Testimonial deleted successfully',

  // Error messages
  NOT_FOUND: 'Testimonial not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',

  // Auth messages
  LOGIN_REQUIRED: 'Please log in to continue',
} as const;

export type TestimonialMessageKey = keyof typeof TESTIMONIAL_MESSAGES;
