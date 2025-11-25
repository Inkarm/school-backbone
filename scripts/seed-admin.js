const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
        where: { login: 'admin' },
        update: {
            password,
            role: 'ADMIN',
        },
        create: {
            login: 'admin',
            password,
            role: 'ADMIN',
            firstName: 'System',
            lastName: 'Admin',
        },
    });

    console.log({ user });
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
