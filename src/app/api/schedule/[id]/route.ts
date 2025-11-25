import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const event = await prisma.scheduleEvent.findUnique({
            where: { id: parseInt(id) },
            include: {
                group: true,
                trainer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                room: true,
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { trainerId, roomId, status, description, date, startTime, endTime } = body;

        const updateData: any = {};
        if (trainerId) updateData.trainerId = trainerId;
        if (roomId !== undefined) updateData.roomId = roomId; // Allow null
        if (status) updateData.status = status;
        if (description !== undefined) updateData.description = description;
        if (date) updateData.date = date;
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;

        const event = await prisma.scheduleEvent.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                group: true,
                trainer: true,
                room: true,
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error updating schedule event:', error);
        return NextResponse.json(
            { error: 'Failed to update schedule event' },
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

        await prisma.scheduleEvent.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule event:', error);
        return NextResponse.json(
            { error: 'Failed to delete schedule event' },
            { status: 500 }
        );
    }
}
