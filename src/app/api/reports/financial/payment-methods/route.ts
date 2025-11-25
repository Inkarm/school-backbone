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

        // Group by payment method
        const payments = await prisma.payment.groupBy({
            by: ['method'],
            where: {
                paymentDate: dateFilter,
            },
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });

        const data = payments.map(p => ({
            name: p.method === 'cash' ? 'Gotówka' :
                p.method === 'transfer' ? 'Przelew' :
                    p.method === 'card' ? 'Karta' : p.method,
            value: p._sum.amount || 0,
            count: p._count.id,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching payment method stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment method stats' },
            { status: 500 }
        );
    }
}
