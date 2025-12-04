import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { originalTrainerId, substituteTrainerId, dateFrom, dateTo } = body;

        if (!originalTrainerId || !substituteTrainerId || !dateFrom) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);

        const endDate = dateTo ? new Date(dateTo) : new Date(dateFrom);
        endDate.setHours(23, 59, 59, 999);

        // Find events to update
        const eventsToUpdate = await prisma.scheduleEvent.findMany({
            where: {
                trainerId: parseInt(originalTrainerId),
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: { not: 'CANCELLED' },
                isSubstitution: false // Don't re-substitute already substituted events
            },
            include: {
                group: true,
                room: true
            }
        });

        if (eventsToUpdate.length === 0) {
            return NextResponse.json({
                updated: 0,
                message: 'Brak zajęć do zastąpienia w wybranym okresie'
            });
        }

        // Update events with substitution
        const updated = await prisma.scheduleEvent.updateMany({
            where: {
                id: { in: eventsToUpdate.map(e => e.id) }
            },
            data: {
                originalTrainerId: parseInt(originalTrainerId),
                trainerId: parseInt(substituteTrainerId),
                isSubstitution: true,
                substitutedAt: new Date()
            }
        });

        // Fetch updated events with trainer info
        const updatedEvents = await prisma.scheduleEvent.findMany({
            where: {
                id: { in: eventsToUpdate.map(e => e.id) }
            },
            include: {
                group: true,
                room: true,
                trainer: {
                    select: { firstName: true, lastName: true, login: true }
                },
                originalTrainer: {
                    select: { firstName: true, lastName: true, login: true }
                }
            }
        });

        return NextResponse.json({
            updated: updated.count,
            events: updatedEvents,
            message: `Zaktualizowano ${updated.count} zajęć`
        });

    } catch (error) {
        console.error('Error creating substitution:', error);
        return NextResponse.json({ error: 'Failed to create substitution' }, { status: 500 });
    }
}
