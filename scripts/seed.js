const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const trainer = await prisma.user.upsert({
        where: { login: 'admin' },
        update: {},
        create: {
            login: 'admin',
            password: 'password123',
            role: 'trainer',
        },
    });
    console.log('Seeded trainer:', trainer);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
