import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const roomId = parseInt(id);

        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room details' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const roomId = parseInt(id);

        await prisma.room.delete({
            where: { id: roomId },
        });

        return NextResponse.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        return NextResponse.json(
            { error: 'Failed to delete room. It might be used in schedule events.' },
            { status: 500 }
        );
    }
}
