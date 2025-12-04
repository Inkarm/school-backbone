import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('trainerId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    try {
        // Default: today + 7 days
        const startDate = dateFrom ? new Date(dateFrom) : new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = dateTo ? new Date(dateTo) : new Date();
        if (!dateTo) {
            endDate.setDate(endDate.getDate() + 7);
        }
        endDate.setHours(23, 59, 59, 999);

        // Determine trainer filter
        const trainerFilter = trainerId
            ? parseInt(trainerId)
            : (session.user.role === 'TRAINER' ? parseInt(session.user.id) : undefined);

        const events = await prisma.scheduleEvent.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: { not: 'CANCELLED' },
                ...(trainerFilter && { trainerId: trainerFilter })
            },
            include: {
                group: true,
                room: true,
                trainer: {
                    select: { id: true, firstName: true, lastName: true, login: true, color: true }
                },
                originalTrainer: {
                    select: { id: true, firstName: true, lastName: true, login: true }
                },
                attendance: {
                    include: {
                        student: {
                            select: { id: true, firstName: true, lastName: true }
                        }
                    }
                }
            },
            orderBy: [
                { date: 'asc' },
                { startTime: 'asc' }
            ]
        });

        // Group events by date
        const groupedEvents: Record<string, typeof events> = {};
        events.forEach(event => {
            const dateKey = event.date.toISOString().split('T')[0];
            if (!groupedEvents[dateKey]) {
                groupedEvents[dateKey] = [];
            }
            groupedEvents[dateKey].push(event);
        });

        return NextResponse.json({
            events,
            grouped: groupedEvents,
            dateRange: {
                from: startDate.toISOString(),
                to: endDate.toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching agenda:', error);
        return NextResponse.json({ error: 'Failed to fetch agenda' }, { status: 500 });
    }
}
