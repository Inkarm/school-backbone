import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get('studentId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const payments = await prisma.payment.findMany({
            where: {
                AND: [
                    studentId ? { studentId: parseInt(studentId) } : {},
                    startDate ? { date: { gte: new Date(startDate) } } : {},
                    endDate ? { date: { lte: new Date(endDate) } } : {},
                ],
            },
            include: {
                student: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { studentId, amount, date, method, month, notes } = body;

        const payment = await prisma.payment.create({
            data: {
                studentId: parseInt(studentId),
                amount: parseFloat(amount),
                date: new Date(date),
                method,
                month,
                notes,
            },
            include: {
                student: true,
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}
