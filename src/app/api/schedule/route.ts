import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updatePastEventsStatus } from '@/lib/scheduleService';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Auto-update statuses before fetching
        await updatePastEventsStatus();

        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const groupId = searchParams.get('groupId');

        // Build the where clause conditionally
        const whereClause: any = {};

        if (groupId) {
            whereClause.groupId = parseInt(groupId);
        }

        if (startDate && endDate) {
            whereClause.date = {
                gte: new Date(startDate),
                lt: new Date(endDate), // Use lt to exclude the next day's midnight
            };
        } else if (startDate) {
            // If only start date is provided, default to 1 day range if not specified?
            // Or just strict filtering.
            // For now, let's keep it but log warning
            console.warn('Schedule API: endDate missing, returning all future events');
            whereClause.date = { gte: new Date(startDate) };
        } else if (endDate) {
            whereClause.date = { lt: new Date(endDate) };
        }

        const events = await prisma.scheduleEvent.findMany({
            where: whereClause,
            include: {
                group: true,
                trainer: true,
                room: true,
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' },
            ],
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schedule' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { date, startTime, endTime, groupId, trainerId, roomId } = body;

        // Check for conflicts if room is specified
        if (roomId) {
            const conflict = await prisma.scheduleEvent.findFirst({
                where: {
                    roomId: parseInt(roomId),
                    date: new Date(date),
                    status: { not: 'CANCELLED' }, // Ignore cancelled events
                    OR: [
                        {
                            // New starts during existing
                            startTime: { lte: startTime },
                            endTime: { gt: startTime }
                        },
                        {
                            // New ends during existing
                            startTime: { lt: endTime },
                            endTime: { gte: endTime }
                        },
                        {
                            // New encloses existing
                            startTime: { gte: startTime },
                            endTime: { lte: endTime }
                        }
                    ]
                }
            });

            if (conflict) {
                return NextResponse.json(
                    { error: 'Sala jest zajęta w tym terminie!' },
                    { status: 409 }
                );
            }
        }

        const event = await prisma.scheduleEvent.create({
            data: {
                date: new Date(date),
                startTime,
                endTime,
                groupId: parseInt(groupId),
                trainerId: parseInt(trainerId),
                roomId: roomId ? parseInt(roomId) : null,
            },
            include: {
                group: true,
                trainer: true,
                room: true,
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Error creating schedule event:', error);
        return NextResponse.json(
            { error: 'Failed to create schedule event' },
            { status: 500 }
        );
    }
}
