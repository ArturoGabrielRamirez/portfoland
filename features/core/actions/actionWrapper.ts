/**
 * Action Wrapper
 *
 * Provides consistent error handling for all server actions.
 * Catches validation errors, database errors, and generic errors.
 */

'use server';

import type { ActionResponse } from '../types/action';

/**
 * Wraps a server action with consistent error handling
 *
 * @param action - The action function to wrap
 * @returns Normalized ActionResponse
 *
 * @example
 * ```typescript
 * export async function createUser(formData: FormData) {
 *   return actionWrapper<User>(async () => {
 *     const data = await schema.validate({...});
 *     const user = await createUserService(data);
 *     revalidatePath('/users');
 *     return { payload: user, message: 'User created' };
 *   });
 * }
 * ```
 */
export async function actionWrapper<T>(
  action: () => Promise<{ payload: T; message: string }>
): Promise<ActionResponse<T>> {
  try {
    const { payload, message } = await action();
    return { hasError: false, message, payload };
  } catch (error) {
    // Yup validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return { hasError: true, message: error.message, payload: null as T };
    }

    // Prisma known request errors
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      return { hasError: true, message: 'Database error', payload: null as T };
    }

    // Prisma validation errors
    if (error instanceof Error && error.name === 'PrismaClientValidationError') {
      return { hasError: true, message: 'Validation error', payload: null as T };
    }

    // Generic errors
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown error',
      payload: null as T,
    };
  }
}
