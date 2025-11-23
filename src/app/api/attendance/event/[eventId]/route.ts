import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const eventIdNum = parseInt(eventId);

        // Get the event with its group and students
        const event = await prisma.scheduleEvent.findUnique({
            where: { id: eventIdNum },
            include: {
                group: {
                    include: {
                        students: true,
                    },
                },
                attendance: true,
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
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}
