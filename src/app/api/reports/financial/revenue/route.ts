import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Get date 12 months ago
        const today = new Date();
        const pastDate = new Date(today.getFullYear() - 1, today.getMonth(), 1);

        // Fetch payments
        const payments = await prisma.payment.findMany({
            where: {
                paymentDate: {
                    gte: pastDate,
                },
            },
            select: {
                amount: true,
                monthYear: true,
                paymentDate: true,
            },
            orderBy: {
                paymentDate: 'asc',
            },
        });

        // Group by month
        const revenueByMonth: Record<string, number> = {};

        // Initialize last 12 months with 0
        for (let i = 0; i < 12; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
            revenueByMonth[monthKey] = 0;
        }

        payments.forEach(payment => {
            // Use monthYear from payment if available and valid format, otherwise derive from date
            let monthKey = payment.monthYear;
            if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
                monthKey = payment.paymentDate.toISOString().slice(0, 7);
            }

            if (revenueByMonth[monthKey] !== undefined) {
                revenueByMonth[monthKey] += payment.amount;
            } else {
                // Handle cases where payment might be older/newer than initialized range but fetched
                // or just add it if we want to show everything fetched
                revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + payment.amount;
            }
        });

        // Convert to array and sort
        const data = Object.entries(revenueByMonth)
            .map(([month, revenue]) => ({
                month,
                revenue,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        // Filter to keep only last 12 months if needed, or just return what we have
        // The initialization ensures we have at least the last 12 months keys

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch revenue stats' },
            { status: 500 }
        );
    }
}
