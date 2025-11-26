import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            // If on login page and logged in, redirect to dashboard
            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl));
            }

            // If on login page and not logged in, allow access
            if (isOnLogin) {
                return true;
            }

            // For all other routes (dashboard), require login
            if (!isLoggedIn) {
                return false;
            }

            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
