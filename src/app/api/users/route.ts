import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');

        const whereClause: any = {};
        if (role) {
            whereClause.role = role;
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            orderBy: {
                login: 'asc',
            },
            select: {
                id: true,
                login: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                color: true,
                accessLevel: true,
                accessibleGroups: true,
                // Exclude password
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { login, password, role, firstName, lastName, email, phone, bio, color } = body;

        // Basic validation
        if (!login || !password || !role) {
            return NextResponse.json(
                { error: 'Login, password and role are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { login },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this login already exists' },
                { status: 409 }
            );
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                login,
                password: hashedPassword,
                role,
                firstName,
                lastName,
                email,
                phone,
                bio,
                color,
                accessLevel: body.accessLevel || 1,
                accessibleGroups: body.accessibleGroups ? {
                    connect: body.accessibleGroups.map((id: number) => ({ id }))
                } : undefined,
            },
            select: {
                id: true,
                login: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                color: true,
                accessLevel: true,
                accessibleGroups: true,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
