import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const login = 'admin';
    const password = 'password123';

    console.log(`Attempting to verify login for user: ${login}`);

    try {
        const user = await prisma.user.findUnique({ where: { login } });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('User found:', user.login);
        console.log('Stored hash:', user.password);

        const match = await bcrypt.compare(password, user.password);
        console.log('Password match:', match);

        if (match) {
            console.log('SUCCESS: Login verified locally.');
        } else {
            console.log('FAILURE: Password does not match hash.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
