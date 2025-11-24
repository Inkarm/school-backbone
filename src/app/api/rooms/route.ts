import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
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
    } catch (error: any) {
        console.error('Error creating room:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create room' },
            { status: 500 }
        );
    }
}
