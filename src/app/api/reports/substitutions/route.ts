import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const trainerId = searchParams.get('trainerId');

    try {
        // Default: last 30 days
        const endDate = dateTo ? new Date(dateTo) : new Date();
        endDate.setHours(23, 59, 59, 999);

        const startDate = dateFrom ? new Date(dateFrom) : new Date();
        if (!dateFrom) {
            startDate.setDate(startDate.getDate() - 30);
        }
        startDate.setHours(0, 0, 0, 0);

        const whereClause: Record<string, unknown> = {
            isSubstitution: true,
            date: {
                gte: startDate,
                lte: endDate
            }
        };

        if (trainerId) {
            whereClause.trainerId = parseInt(trainerId);
        }

        const substitutions = await prisma.scheduleEvent.findMany({
            where: whereClause,
            include: {
                group: true,
                room: true,
                trainer: {
                    select: { id: true, firstName: true, lastName: true, login: true }
                },
                originalTrainer: {
                    select: { id: true, firstName: true, lastName: true, login: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        // Calculate summary
        const bySubstitute: Record<string, number> = {};
        const byOriginal: Record<string, number> = {};

        substitutions.forEach(sub => {
            const substituteName = sub.trainer.firstName
                ? `${sub.trainer.firstName} ${sub.trainer.lastName}`
                : sub.trainer.login;
            bySubstitute[substituteName] = (bySubstitute[substituteName] || 0) + 1;

            if (sub.originalTrainer) {
                const originalName = sub.originalTrainer.firstName
                    ? `${sub.originalTrainer.firstName} ${sub.originalTrainer.lastName}`
                    : sub.originalTrainer.login;
                byOriginal[originalName] = (byOriginal[originalName] || 0) + 1;
            }
        });

        return NextResponse.json({
            substitutions: substitutions.map(sub => ({
                id: sub.id,
                date: sub.date,
                startTime: sub.startTime,
                endTime: sub.endTime,
                group: sub.group.name,
                room: sub.room?.name || 'Brak sali',
                originalTrainer: sub.originalTrainer
                    ? (sub.originalTrainer.firstName
                        ? `${sub.originalTrainer.firstName} ${sub.originalTrainer.lastName}`
                        : sub.originalTrainer.login)
                    : 'Nieznany',
                substituteTrainer: sub.trainer.firstName
                    ? `${sub.trainer.firstName} ${sub.trainer.lastName}`
                    : sub.trainer.login,
                substitutedAt: sub.substitutedAt
            })),
            summary: {
                total: substitutions.length,
                bySubstitute,
                byOriginal
            },
            dateRange: {
                from: startDate.toISOString(),
                to: endDate.toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching substitutions report:', error);
        return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }
}
