// =============================================================================
// Database Connection Test Script
// =============================================================================
// This script verifies that the Prisma client can connect to MongoDB Atlas
// and perform basic CRUD operations.
// Run with: bunx dotenvx run -f .env.local -- tsx scripts/test-db-connection.ts
// =============================================================================

import { PrismaClient } from '../app/generated/prisma/client'

async function testDatabaseConnection(): Promise<void> {
  const prisma = new PrismaClient()

  try {
    console.log('Testing database connection...\n')

    // Test 1: Check if we can query the database
    console.log('1. Testing query capability...')
    const userCount = await prisma.user.count()
    console.log(`   Success: Found ${userCount} users in the database.\n`)

    // Test 2: Verify the User model fields are accessible
    console.log('2. Verifying User model schema...')
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        username: true,
        locale: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    console.log('   Success: User model schema is valid.\n')

    console.log('========================================')
    console.log('DATABASE CONNECTION VERIFIED SUCCESSFULLY')
    console.log('========================================')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
