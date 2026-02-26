// =============================================================================
// Prisma Client Singleton
// =============================================================================
// Provides a singleton Prisma client instance for database operations.
// Handles Next.js development hot-reload without creating multiple instances.
// =============================================================================

import 'server-only';
import { PrismaClient } from '@/app/generated/prisma/client'

// Extend globalThis to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma client instance.
 *
 * In development, Next.js hot-reloads can cause multiple Prisma client
 * instances to be created, which exhausts database connections.
 * This pattern stores the client on globalThis to survive hot-reloads.
 *
 * In production, a new client is created once per application instance.
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Only cache the client in development to survive hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
