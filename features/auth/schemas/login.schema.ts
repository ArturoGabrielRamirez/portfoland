/**
 * Login Form Validation Schema
 *
 * Schema for validating email/password login form submissions.
 * Used with react-hook-form and yupResolver for client-side validation.
 */
import * as yup from 'yup';
import { emailField, passwordField } from './authFields';

/**
 * Login schema
 * - email: required, valid email format
 * - password: required, minimum 8 characters
 *
 * Note: We apply full password validation on login to ensure
 * users meet the minimum requirements before attempting authentication.
 */
export const loginSchema = yup.object({
  email: emailField.required('Email is required'),
  password: passwordField.required('Password is required'),
});

/**
 * Inferred TypeScript type from the login schema
 * Use this type for form data and function parameters
 */
export type LoginInput = yup.InferType<typeof loginSchema>;
