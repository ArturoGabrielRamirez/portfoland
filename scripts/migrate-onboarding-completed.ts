/**
 * Migration: Set onboardingCompleted = true for all existing users
 *
 * Run after deploying the onboardingCompleted schema field to prevent
 * existing users from being forced through the onboarding flow.
 *
 * Usage: npx tsx scripts/migrate-onboarding-completed.ts
 */

import { PrismaClient } from '../app/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.updateMany({
    data: { onboardingCompleted: true },
  })
  console.log(`Migrated ${result.count} users — set onboardingCompleted: true`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
