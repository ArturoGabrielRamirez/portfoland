/**
 * Registration Form Validation Schema
 *
 * Schema for validating new user registration form submissions.
 * Used with react-hook-form and yupResolver for client-side validation.
 */
import * as yup from 'yup';
import { emailField, nameField, passwordField } from './authFields';

/**
 * Registration schema
 * - name: required
 * - email: required, valid email format
 * - password: required, minimum 8 characters
 * - confirmPassword: required, must match password field
 */
export const registerSchema = yup.object({
  name: nameField.required('Name is required'),
  email: emailField.required('Email is required'),
  password: passwordField.required('Password is required'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

/**
 * Inferred TypeScript type from the registration schema
 * Use this type for form data and function parameters
 */
export type RegisterInput = yup.InferType<typeof registerSchema>;
