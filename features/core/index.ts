/**
 * Core Feature
 *
 * Shared utilities for all features.
 */

// Actions
export { actionWrapper } from './actions/actionWrapper';

// Constants
export {
  RESERVED_SUBDOMAINS,
  isReservedSubdomain,
} from './constants/reservedSubdomains';

// Types
export type { ActionResponse, ActionSuccess, ActionError } from './types/action';

// Re-export prisma for convenience
export { prisma } from '@/lib/prisma';
