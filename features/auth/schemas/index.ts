/**
 * Auth Schemas Index
 *
 * Re-exports all authentication validation schemas and types
 * for convenient importing.
 *
 * Usage:
 *   import { loginSchema, LoginInput } from '@/features/auth/schemas';
 *   import { registerSchema, RegisterInput } from '@/features/auth/schemas';
 */

// Field validators (for composition in other schemas if needed)
export {
  emailField,
  nameField,
  passwordField,
} from './authFields';

// Login schema and type
export { loginSchema, type LoginInput } from './login.schema';

// Registration schema and type
export { registerSchema, type RegisterInput } from './register.schema';
