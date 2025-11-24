import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { firstName, lastName, email, phone, bio, color, password } = body;

        const updateData: any = {
            firstName,
            lastName,
            email,
            phone,
            bio,
            color,
        };

        // Only update password if provided
        if (password) {
            updateData.password = password; // Should be hashed!
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: {
                id: true,
                login: true,
                role: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                color: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if user has related records (groups, events)
        // If so, we might want to prevent deletion or handle it gracefully
        // For now, we'll let Prisma throw an error if there are foreign key constraints
        // or we could check manually.

        // Let's check manually to give a better error message
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { groups: true, scheduleEvents: true }
                }
            }
        });

        if (user && (user._count.groups > 0 || user._count.scheduleEvents > 0)) {
            return NextResponse.json(
                { error: 'Cannot delete trainer with assigned groups or schedule events. Reassign them first.' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
