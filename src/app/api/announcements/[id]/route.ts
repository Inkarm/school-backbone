import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const announcementId = parseInt(id);

    try {
        const body = await request.json();
        const { title, content, priority, isPinned } = body;

        const updated = await prisma.announcement.update({
            where: { id: announcementId },
            data: {
                title,
                content,
                priority,
                isPinned
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const announcementId = parseInt(id);

    try {
        await prisma.announcement.delete({
            where: { id: announcementId }
        });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}
