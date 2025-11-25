import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const today = new Date();
        const stats = [];

        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const monthKey = d.toISOString().slice(0, 7); // YYYY-MM

            // Count active students at the end of this month
            // (Students created before end of month)
            // Note: This is a simplified metric. Real retention needs "dropped" date which we don't strictly track yet 
            // except via updated_at or logs. For now, we'll use total count up to that point.

            const activeCount = await prisma.student.count({
                where: {
                    createdAt: {
                        lte: monthEnd
                    }
                }
            });

            // Count new students in this month
            const newCount = await prisma.student.count({
                where: {
                    createdAt: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            });

            // For "dropped", we don't have a specific field yet (e.g. status=INACTIVE).
            // We'll simulate it or leave it as 0 for now until we add status tracking.
            // Or we could check if they have no attendance in the last X months? 
            // Let's stick to "New" and "Total" for now as they are accurate.

            stats.push({
                month: monthKey,
                active: activeCount,
                new: newCount,
                dropped: 0 // Placeholder for future implementation
            });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching student growth stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student growth stats' },
            { status: 500 }
        );
    }
}
