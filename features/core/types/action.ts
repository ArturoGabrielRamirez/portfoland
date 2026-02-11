/**
 * Action Response Types
 *
 * Types for standardized server action responses.
 */

/**
 * Standard response format for all server actions
 */
export interface ActionResponse<T> {
  hasError: boolean;
  message: string;
  payload: T;
}

/**
 * Success response helper type
 */
export type ActionSuccess<T> = ActionResponse<T> & { hasError: false };

/**
 * Error response helper type
 */
export type ActionError<T> = ActionResponse<T> & { hasError: true; payload: null };
