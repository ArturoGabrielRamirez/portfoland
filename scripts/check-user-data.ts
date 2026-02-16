/**
 * Script to check user's complete data including OAuth accounts
 *
 * Usage: bun run scripts/check-user-data.ts <user-email>
 */

import { prisma } from '../lib/prisma';

async function checkUserData(email: string) {
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
        accounts: true,
      },
    });

    if (!user) {
      console.error('User not found!');
      process.exit(1);
    }

    console.log('\n=== USER DATA ===');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Image:', user.image);
    console.log('OAuth Image:', user.oauthImage);

    console.log('\n=== OAUTH ACCOUNTS ===');
    if (user.accounts.length === 0) {
      console.log('No OAuth accounts found.');
    } else {
      user.accounts.forEach((account, index) => {
        console.log(`\nAccount ${index + 1}:`);
        console.log('Provider:', account.providerId);
        console.log('Account ID:', account.accountId);
        console.log('Access Token:', account.accessToken ? '(exists)' : '(none)');
        console.log('Refresh Token:', account.refreshToken ? '(exists)' : '(none)');
        console.log('ID Token:', account.idToken ? '(exists)' : '(none)');
      });
    }

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
  console.error('Usage: bun run scripts/check-user-data.ts user@example.com');
  process.exit(1);
}

checkUserData(email);
