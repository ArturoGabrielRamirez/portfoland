/**
 * Script to reset oauthImage field
 *
 * Usage: bun run scripts/reset-oauth-image.ts <user-email>
 */

import { prisma } from '../lib/prisma';

async function resetOAuthImage(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        oauthImage: true,
      },
    });

    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    console.log('Current user data:');
    console.log('- image:', user.image);
    console.log('- oauthImage:', user.oauthImage);

    // Reset oauthImage to null
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { oauthImage: null },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        oauthImage: true,
      },
    });

    console.log('\n✅ oauthImage field cleared successfully!');
    console.log('Updated user data:');
    console.log('- image:', updated.image);
    console.log('- oauthImage:', updated.oauthImage);
    console.log('\nNext time you access /dashboard/portfolio, it will capture the OAuth image from your session.');

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
  console.error('Usage: bun run scripts/reset-oauth-image.ts user@example.com');
  process.exit(1);
}

resetOAuthImage(email);
