import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const login = searchParams.get('login');
        const password = searchParams.get('password');

        if (!login || !password) {
            return NextResponse.json({ error: 'Missing login or password' });
        }

        const user = await prisma.user.findUnique({
            where: { login },
        });

        if (!user) {
            return NextResponse.json({
                status: 'error',
                message: 'User not found in DB',
                login
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        return NextResponse.json({
            status: isMatch ? 'success' : 'error',
            message: isMatch ? 'Password is correct' : 'Password mismatch',
            user: {
                id: user.id,
                login: user.login,
                role: user.role,
                passwordHash: user.password.substring(0, 10) + '...', // Show part of hash
            },
            check: {
                inputPassword: password,
                matchResult: isMatch
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: 'Server error',
            details: error.message
        });
    }
}
