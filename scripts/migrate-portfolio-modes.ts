/**
 * Migration Script: Rename Portfolio Modes
 *
 * Phase 1 Rebrand: "gaming" → "tech", "professional" → "classic"
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * Documents already on the new values are not touched.
 *
 * Run with:
 *   npx tsx scripts/migrate-portfolio-modes.ts
 */

import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Portfolio Modes Migration ===');
  console.log('Renaming: "gaming" → "tech" and "professional" → "classic"\n');

  // 1. gaming → tech
  const gamingResult = await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: { portfolioMode: 'gaming' },
        u: { $set: { portfolioMode: 'tech' } },
        multi: true,
      },
    ],
  }) as { n: number; nModified: number };

  console.log(`gaming → tech: ${gamingResult.nModified ?? gamingResult.n} documents updated`);

  // 2. professional → classic
  const professionalResult = await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: { portfolioMode: 'professional' },
        u: { $set: { portfolioMode: 'classic' } },
        multi: true,
      },
    ],
  }) as { n: number; nModified: number };

  console.log(`professional → classic: ${professionalResult.nModified ?? professionalResult.n} documents updated`);

  // 3. Clean up stale AI narrative caches keyed with old mode names
  //    Cache keys: aiNarrative_gaming_en, aiNarrative_gaming_es,
  //                aiNarrative_professional_en, aiNarrative_professional_es
  const cacheResult = await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: {
          $or: [
            { 'meta.aiNarrative_gaming_en': { $exists: true } },
            { 'meta.aiNarrative_gaming_es': { $exists: true } },
            { 'meta.aiNarrative_professional_en': { $exists: true } },
            { 'meta.aiNarrative_professional_es': { $exists: true } },
          ],
        },
        u: {
          $unset: {
            'meta.aiNarrative_gaming_en': '',
            'meta.aiNarrative_gaming_es': '',
            'meta.aiNarrative_professional_en': '',
            'meta.aiNarrative_professional_es': '',
          },
        },
        multi: true,
      },
    ],
  }) as { n: number; nModified: number };

  console.log(`Stale narrative cache cleared: ${cacheResult.nModified ?? cacheResult.n} documents updated`);

  // 4. Verify final state
  const remaining = await prisma.$runCommandRaw({
    count: 'User',
    query: { portfolioMode: { $in: ['gaming', 'professional'] } },
  }) as { n: number };

  if (remaining.n > 0) {
    console.error(`\nWARNING: ${remaining.n} documents still have old mode values!`);
    process.exit(1);
  }

  console.log('\nMigration complete. No documents with old mode values remain.');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
