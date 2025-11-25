import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        // Fetch payments with student and their groups
        const payments = await prisma.payment.findMany({
            where: {
                paymentDate: dateFilter,
            },
            include: {
                student: {
                    include: {
                        groups: true,
                    },
                },
            },
        });

        const revenueByGroup: Record<string, number> = {};

        payments.forEach(payment => {
            const groups = payment.student.groups;
            const amount = payment.amount;

            if (groups.length > 0) {
                // Split amount equally among groups
                const amountPerGroup = amount / groups.length;

                groups.forEach(group => {
                    revenueByGroup[group.name] = (revenueByGroup[group.name] || 0) + amountPerGroup;
                });
            } else {
                // Student has no group
                revenueByGroup['Bez grupy'] = (revenueByGroup['Bez grupy'] || 0) + amount;
            }
        });

        const data = Object.entries(revenueByGroup)
            .map(([name, value]) => ({
                name,
                value: Math.round(value * 100) / 100, // Round to 2 decimals
            }))
            .sort((a, b) => b.value - a.value); // Sort by revenue descending

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching group revenue stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch group revenue stats' },
            { status: 500 }
        );
    }
}
