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
                const parsedCredentials = z
                    .object({ login: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { login, password } = parsedCredentials.data;
                    console.log(`[AUTH] Attempting login for user: ${login}`);

                    const user = await getUser(login);
                    if (!user) {
                        console.log('[AUTH] User not found in database');
                        return null;
                    }
                    console.log(`[AUTH] User found: ${user.login} (ID: ${user.id})`);

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log(`[AUTH] Password match result: ${passwordsMatch}`);

                    if (passwordsMatch) return { ...user, id: user.id.toString() };
                }

                console.log('[AUTH] Authorization failed');
                return null;
            },
        }),
    ],
});
