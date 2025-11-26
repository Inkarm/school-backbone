import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async () => {
    const rooms = await prisma.room.findMany({
        orderBy: { name: 'asc' },
    });
    return NextResponse.json(rooms);
});

export const POST = authorizedRoute(async (req) => {
    const body = await req.json();
    const { name, capacity } = body;

    if (!name || !capacity) {
        return NextResponse.json(
            { error: 'Name and capacity are required' },
            { status: 400 }
        );
    }

    const room = await prisma.room.create({
        data: {
            name,
            capacity: parseInt(capacity),
        },
    });

    return NextResponse.json(room, { status: 201 });
});
