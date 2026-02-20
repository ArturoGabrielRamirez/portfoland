
import { prisma } from '../lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            id: true,
            email: true,
            name: true,
            meta: true
        }
    });

    console.log('--- DEBUG USER DATA ---');
    users.forEach(u => {
        console.log(`User: ${u.name} (${u.email})`);
        console.log(`ID: ${u.id}`);
        console.log(`Meta:`, JSON.stringify(u.meta, null, 2));
        console.log('---');
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
