import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function getUser(login: string) {
    try {
        const user = await prisma.user.findUnique({ where: { login } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('Authorize called with:', credentials);
                const parsedCredentials = z
                    .object({ login: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { login, password } = parsedCredentials.data;
                    console.log('Fetching user for login:', login);
                    const user = await getUser(login);
                    console.log('User found:', user ? 'Yes' : 'No');
                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log('Password match:', passwordsMatch);
                    if (passwordsMatch) return { ...user, id: user.id.toString() };
                } else {
                    console.log('Invalid credentials format');
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
