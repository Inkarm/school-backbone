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
    return NextResponse.json(user);
});

export const PUT = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await req.json();
    const { login, password, role, firstName, lastName, email, phone, bio, color, accessLevel, accessibleGroups } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify login uniqueness if changed
    if (login && login !== existingUser.login) {
        const duplicate = await prisma.user.findUnique({ where: { login } });
        if (duplicate) {
            return NextResponse.json({ error: 'Login already taken' }, { status: 409 });
        }
    }

    const dataToUpdate: any = {
        login,
        role,
        firstName,
        lastName,
        email,
        phone,
        bio,
        color,
        accessLevel: accessLevel || existingUser.accessLevel,
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
        const bcrypt = require('bcryptjs');
        dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Update relationships if provided
    if (accessibleGroups) {
        // Disconnect all and connect selected
        dataToUpdate.accessibleGroups = {
            set: [], // Clear existing relations
            connect: accessibleGroups.map((groupId: number) => ({ id: groupId }))
        };
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
            id: true,
            login: true,
            role: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
        }
    });

    return NextResponse.json(updatedUser);
}, { roles: ['ADMIN'] });

export const DELETE = authorizedRoute(async (req, { params, session }) => {
    const { id } = await params;
    const userId = parseInt(id);

    // Prevent deleting yourself
    if (session.user.id && parseInt(session.user.id) === userId) {
        return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Transactional cleanup
    await prisma.$transaction(async (tx) => {
        // 1. Unlink from Groups (set defaultTrainer to null)
        await tx.group.updateMany({
            where: { defaultTrainerId: userId },
            data: { defaultTrainerId: null }
        });

        // 2. Events are handled by Cascade (Schema) or we can delete manually to be sure
        // await tx.scheduleEvent.deleteMany({ where: { trainerId: userId } }); // Schema handles this now

        // 3. Delete user
        await tx.user.delete({
            where: { id: userId },
        });
    });

    return NextResponse.json({ message: 'User deleted successfully' });
}, { roles: ['ADMIN'] });
