import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const roomId = parseInt(id);
        const body = await request.json();
        const { name, capacity } = body;

        if (!name || !capacity) {
            return NextResponse.json(
                { error: 'Name and capacity are required' },
                { status: 400 }
            );
        }

        const room = await prisma.room.update({
            where: { id: roomId },
            data: {
                name,
                capacity: parseInt(capacity),
            },
        });

        return NextResponse.json(room);
    } catch (error: any) {
        console.error('Error updating room:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update room' },
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
        const roomId = parseInt(id);

        await prisma.room.delete({
            where: { id: roomId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting room:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete room' },
            { status: 500 }
        );
    }
}
