/**
 * Script to fix corrupted user image URLs
 *
 * Usage: bun run scripts/fix-user-image.ts <user-email>
 */

import { prisma } from '../lib/prisma';

async function fixUserImage(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, image: true },
    });

    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    console.log('Current user data:', user);

    // Update image to null
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
      select: { id: true, email: true, name: true, image: true },
    });

    console.log('✅ User image cleared successfully!');
    console.log('Updated user data:', updated);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Please provide a user email as argument');
  console.error('Usage: bun run scripts/fix-user-image.ts user@example.com');
  process.exit(1);
}

fixUserImage(email);
