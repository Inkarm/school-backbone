import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const roomId = parseInt(id);

    const room = await prisma.room.findUnique({
        where: { id: roomId },
    });

    if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
});

export const DELETE = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const roomId = parseInt(id);

    await prisma.room.delete({
        where: { id: roomId },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
}, { roles: ['ADMIN'] });
