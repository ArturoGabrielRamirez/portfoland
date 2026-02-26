
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
    const username = 'gabo';
    console.log(`Checking for user: ${username}...`);

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            // Check schema to see what's actually available if needed
        }
    });

    if (user) {
        console.log('User found:', user);
    } else {
        // Try finding any user to see what usernames exist
        const allUsers = await prisma.user.findMany({ take: 5 });
        console.log('User gabo NOT found.');
        console.log('Existing users:', allUsers.map(u => u.username));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
