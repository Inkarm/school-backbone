import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/dashboard/stats
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get today's date range
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Get first and last day of current month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Count today's classes
        const todayClasses = await prisma.scheduleEvent.count({
            where: {
                date: {
                    gte: todayStart,
                    lt: todayEnd,
                },
            },
        });

        // Count total active students
        const totalStudents = await prisma.student.count();

        // Calculate this month's revenue
        const monthlyPayments = await prisma.payment.aggregate({
            where: {
                paymentDate: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const monthlyRevenue = monthlyPayments._sum.amount || 0;

        // Additional stats
        const totalGroups = await prisma.group.count();
        const totalTrainers = await prisma.user.count({
            where: {
                role: 'TRAINER',
            },
        });

        return NextResponse.json({
            todayClasses,
            totalStudents,
            monthlyRevenue: Number(monthlyRevenue),
            totalGroups,
            totalTrainers,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
