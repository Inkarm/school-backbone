import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const seriesId = parseInt(id);

    try {
        // Delete future events linked to this series
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        await prisma.$transaction([
            // Delete future events
            prisma.scheduleEvent.deleteMany({
                where: {
                    seriesId: seriesId,
                    date: { gte: now }
                }
            }),
            // Delete the series definition itself
            prisma.recurringSchedule.delete({
                where: { id: seriesId }
            })
        ]);

        return NextResponse.json({ message: 'Series deleted' });
    } catch (error) {
        console.error('Error deleting series:', error);
        return NextResponse.json(
            { error: 'Failed to delete series' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const seriesId = parseInt(id);

    try {
        const body = await request.json();
        const { trainerId, roomId, startTime, endTime, description } = body;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Update series and future events
        await prisma.$transaction([
            // Update series definition
            prisma.recurringSchedule.update({
                where: { id: seriesId },
                data: {
                    trainerId,
                    roomId,
                    startTime,
                    endTime,
                    description
                }
            }),
            // Update future events
            prisma.scheduleEvent.updateMany({
                where: {
                    seriesId: seriesId,
                    date: { gte: now }
                },
                data: {
                    trainerId,
                    roomId,
                    startTime,
                    endTime,
                    description
                }
            })
        ]);

        return NextResponse.json({ message: 'Series updated' });
    } catch (error) {
        console.error('Error updating series:', error);
        return NextResponse.json(
            { error: 'Failed to update series' },
            { status: 500 }
        );
    }
}
