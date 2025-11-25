import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updatePastEventsStatus } from '@/lib/scheduleService';

export async function GET(request: NextRequest) {
    try {
        // Auto-update statuses before fetching stats
        await updatePastEventsStatus();

        const searchParams = request.nextUrl.searchParams;
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        if (!startDateStr || !endDateStr) {
            return NextResponse.json(
                { error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        // Fetch all COMPLETED events in the range
        const events = await prisma.scheduleEvent.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'COMPLETED',
            },
            include: {
                group: true,
                trainer: true,
            },
        });

        const stats: Record<number, {
            trainerId: number;
            trainerName: string;
            regularHours: number;
            substitutionHours: number;
            totalHours: number;
            eventCount: number;
        }> = {};

        events.forEach(event => {
            const trainerId = event.trainerId;
            const trainerName = event.trainer.firstName
                ? `${event.trainer.firstName} ${event.trainer.lastName}`
                : event.trainer.login;

            if (!stats[trainerId]) {
                stats[trainerId] = {
                    trainerId,
                    trainerName,
                    regularHours: 0,
                    substitutionHours: 0,
                    totalHours: 0,
                    eventCount: 0,
                };
            }

            // Calculate duration in hours
            const [startH, startM] = event.startTime.split(':').map(Number);
            const [endH, endM] = event.endTime.split(':').map(Number);
            const duration = (endH + endM / 60) - (startH + startM / 60);

            // Check if substitution
            const isSubstitution = event.group && event.group.defaultTrainerId && event.group.defaultTrainerId !== trainerId;

            if (isSubstitution) {
                stats[trainerId].substitutionHours += duration;
            } else {
                stats[trainerId].regularHours += duration;
            }
            stats[trainerId].totalHours += duration;
            stats[trainerId].eventCount++;
        });

        return NextResponse.json(Object.values(stats));

    } catch (error) {
        console.error('Error fetching trainer stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trainer stats' },
            { status: 500 }
        );
    }
}
