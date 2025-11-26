import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            login: true,
            role: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            bio: true,
            color: true,
            accessLevel: true,
            groups: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
});

export const DELETE = authorizedRoute(async (req, { params, session }) => {
    const { id } = await params;
    const userId = parseInt(id);

    // Prevent deleting yourself
    if (session.user.id && parseInt(session.user.id) === userId) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
}, { roles: ['ADMIN'] });
