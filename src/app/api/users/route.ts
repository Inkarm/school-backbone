import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req) => {
    const searchParams = req.nextUrl.searchParams;
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
        },
    });

    return NextResponse.json(users);
});

export const POST = authorizedRoute(async (req) => {
    const body = await req.json();
    const { login, password, role, firstName, lastName, email, phone, bio, color } = body;

    if (!login || !password || !role) {
        return NextResponse.json(
            { error: 'Login, password and role are required' },
            { status: 400 }
        );
    }

    const existingUser = await prisma.user.findUnique({
        where: { login },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: 'User with this login already exists' },
            { status: 409 }
        );
    }

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
});
