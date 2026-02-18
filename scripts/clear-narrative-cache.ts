/**
 * Clear AI Narrative Cache Script
 *
 * Removes all cached AI narratives from User.meta to force regeneration
 * with updated prompts.
 *
 * Run: npx tsx scripts/clear-narrative-cache.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { prisma } from '../lib/prisma';

async function clearNarrativeCache() {
  try {
    console.log('🔍 Finding users with cached narratives...');

    const users = await prisma.user.findMany({
      where: {
        meta: {
          not: null
        }
      },
      select: {
        id: true,
        username: true,
        meta: true
      }
    });

    console.log(`📊 Found ${users.length} users with meta data`);

    let clearedCount = 0;

    for (const user of users) {
      const meta = (user.meta as any) || {};

      // Check if user has any narrative cache keys
      const hasCachedNarrative = Object.keys(meta).some(key =>
        key.startsWith('aiNarrative_')
      );

      if (hasCachedNarrative) {
        // Remove all aiNarrative_* keys
        const cleanedMeta = Object.keys(meta).reduce((acc, key) => {
          if (!key.startsWith('aiNarrative_')) {
            acc[key] = meta[key];
          }
          return acc;
        }, {} as Record<string, any>);

        await prisma.user.update({
          where: { id: user.id },
          data: { meta: cleanedMeta }
        });

        clearedCount++;
        console.log(`✅ Cleared cache for user: ${user.username || user.id}`);
      }
    }

    console.log(`\n🎉 Done! Cleared cache for ${clearedCount} users`);
    console.log('💡 Next portfolio view will generate fresh narratives with new prompts');

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearNarrativeCache();
