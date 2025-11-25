import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const studentId = searchParams.get('studentId');
        const groupId = searchParams.get('groupId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const payments = await prisma.payment.findMany({
            where: {
                AND: [
                    studentId ? { studentId: parseInt(studentId) } : {},
                    groupId ? {
                        student: {
                            groups: {
                                some: {
                                    id: parseInt(groupId)
                                }
                            }
                        }
                    } : {},
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
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Handle bulk creation (array)
        if (Array.isArray(body)) {
            const payments = await prisma.$transaction(
                body.map((payment: any) => prisma.payment.create({
                    data: {
                        studentId: parseInt(payment.studentId),
                        amount: parseFloat(payment.amount),
                        paymentDate: new Date(payment.paymentDate),
                        method: payment.method,
                        monthYear: payment.monthYear,
                    }
                }))
            );
            return NextResponse.json(payments, { status: 201 });
        }

        // Handle single creation (legacy support)
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
