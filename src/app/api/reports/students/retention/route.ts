import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Default to last 30 days
        const end = endDateParam ? new Date(endDateParam) : new Date();
        const start = startDateParam ? new Date(startDateParam) : new Date();
        if (!startDateParam) start.setDate(start.getDate() - 30);

        // 1. Get total active students at the START of the period
        // This is tricky without a history table. We have to infer it.
        // Or we can just take current active students and look at createdAt?
        // Let's use a simpler metric for now:
        // Retention Rate = (Active Students at End - New Students during period) / Active Students at Start

        // Since we don't have a status history log, we will approximate:
        // Start Count = (Current Active + Archived during period) - New during period?
        // This is getting complicated without a history table.

        // Alternative simple metric:
        // Churn Rate = (Students who became INACTIVE/ARCHIVED during period) / (Total Active at Start)

        // Given the current schema, we only have `updatedAt`.
        // We can't know for sure WHEN status changed to ARCHIVED.
        // But we can check `createdAt` for new students.

        // Let's implement a simplified snapshot:
        // Active Students Now
        // New Students (createdAt in range)
        // Archived Students (status = ARCHIVED) - we assume they churned recently if updatedAt is in range?

        const activeStudents = await prisma.student.count({
            where: { status: 'ACTIVE' }
        });

        const newStudents = await prisma.student.count({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        const archivedStudents = await prisma.student.count({
            where: {
                status: 'ARCHIVED',
                updatedAt: {
                    gte: start,
                    lte: end
                }
            }
        });

        // Approximate Start Count
        // Start = End (Active) - New + Churned (Archived)
        const startCount = activeStudents - newStudents + archivedStudents;

        // Retention Rate = ((End Count - New) / Start Count) * 100
        // (Active - New) / Start
        const retentionRate = startCount > 0
            ? ((activeStudents - newStudents) / startCount) * 100
            : 100;

        // Churn Rate = (Churned / Start Count) * 100
        const churnRate = startCount > 0
            ? (archivedStudents / startCount) * 100
            : 0;

        return NextResponse.json({
            activeStudents,
            newStudents,
            churnedStudents: archivedStudents,
            retentionRate: Math.round(retentionRate * 10) / 10,
            churnRate: Math.round(churnRate * 10) / 10,
            period: {
                start: start.toISOString(),
                end: end.toISOString()
            }
        });

    } catch (error) {
        console.error('Error calculating retention:', error);
        return NextResponse.json(
            { error: 'Failed to calculate retention metrics' },
            { status: 500 }
        );
    }
}
