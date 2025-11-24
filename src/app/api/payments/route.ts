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
                    startDate ? { paymentDate: { gte: new Date(startDate) } } : {},
                    endDate ? { paymentDate: { lte: new Date(endDate) } } : {},
                ],
            },
            include: {
                student: true,
            },
            orderBy: {
                paymentDate: 'desc',
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
        const { studentId, amount, paymentDate, method, monthYear } = body;

        if (!studentId || !amount || !paymentDate) {
            return NextResponse.json(
                { error: 'Missing required fields: studentId, amount, or paymentDate' },
                { status: 400 }
            );
        }

        const payment = await prisma.payment.create({
            data: {
                studentId: parseInt(studentId),
                amount: parseFloat(amount),
                paymentDate: new Date(paymentDate),
                method,
                monthYear,
            },
            include: {
                student: true,
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        );
    }
}
