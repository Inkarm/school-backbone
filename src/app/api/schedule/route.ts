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
        const { date, startTime, endTime, groupId, trainerId, roomId, description, isRecurring, recurrenceEndDate } = body;

        const parsedDate = new Date(date);
        const parsedGroupId = parseInt(groupId);
        const parsedTrainerId = parseInt(trainerId);
        const parsedRoomId = roomId ? parseInt(roomId) : null;

        // Helper to check conflicts
        const checkConflict = async (checkDate: Date) => {
            const timeConditions = [
                { startTime: { lte: startTime }, endTime: { gt: startTime } },
                { startTime: { lt: endTime }, endTime: { gte: endTime } },
                { startTime: { gte: startTime }, endTime: { lte: endTime } }
            ];

            // Check Room Conflict
            if (parsedRoomId) {
                const roomConflict = await prisma.scheduleEvent.findFirst({
                    where: {
                        roomId: parsedRoomId,
                        date: checkDate,
                        status: { not: 'CANCELLED' },
                        OR: timeConditions
                    }
                });
                if (roomConflict) return `Sala jest zajęta w dniu ${checkDate.toLocaleDateString()}!`;
            }

            // Check Trainer Conflict
            const trainerConflict = await prisma.scheduleEvent.findFirst({
                where: {
                    trainerId: parsedTrainerId,
                    date: checkDate,
                    status: { not: 'CANCELLED' },
                    OR: timeConditions
                }
            });
            if (trainerConflict) return `Trener prowadzi inne zajęcia w dniu ${checkDate.toLocaleDateString()}!`;

            return null;
        };

        if (isRecurring && recurrenceEndDate) {
            const endDate = new Date(recurrenceEndDate);
            const dates: Date[] = [];
            let currentDate = new Date(parsedDate);

            // Generate dates
            while (currentDate <= endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 7);
            }

            // Check conflicts for ALL dates
            for (const d of dates) {
                const conflictError = await checkConflict(d);
                if (conflictError) {
                    return NextResponse.json(
                        { error: conflictError },
                        { status: 409 }
                    );
                }
            }

            // Create Series and Events in transaction
            const result = await prisma.$transaction(async (tx) => {
                const series = await tx.recurringSchedule.create({
                    data: {
                        startDate: parsedDate,
                        endDate: endDate,
                        dayOfWeek: parsedDate.getDay(),
                        startTime,
                        endTime,
                        groupId: parsedGroupId,
                        trainerId: parsedTrainerId,
                        roomId: parsedRoomId,
                        description
                    }
                });

                await tx.scheduleEvent.createMany({
                    data: dates.map(d => ({
                        date: d,
                        startTime,
                        endTime,
                        groupId: parsedGroupId,
                        trainerId: parsedTrainerId,
                        roomId: parsedRoomId,
                        description,
                        seriesId: series.id
                    }))
                });

                return series;
            });

            return NextResponse.json({ message: 'Series created', seriesId: result.id }, { status: 201 });

        } else {
            // Single Event
            const conflictError = await checkConflict(parsedDate);
            if (conflictError) {
                return NextResponse.json(
                    { error: conflictError },
                    { status: 409 }
                );
            }

            const event = await prisma.scheduleEvent.create({
                data: {
                    date: parsedDate,
                    startTime,
                    endTime,
                    groupId: parsedGroupId,
                    trainerId: parsedTrainerId,
                    roomId: parsedRoomId,
                    description,
                },
                include: {
                    group: true,
                    trainer: true,
                    room: true,
                },
            });

            return NextResponse.json(event, { status: 201 });
        }
    } catch (error) {
        console.error('Error creating schedule event:', error);
        return NextResponse.json(
            { error: 'Failed to create schedule event' },
            { status: 500 }
        );
    }
}
