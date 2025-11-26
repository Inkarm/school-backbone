import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const monthYear = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM

        // 1. Get all active students
        const students = await prisma.student.findMany({
            where: {
                status: 'ACTIVE',
                groups: {
                    some: {} // Only students assigned to at least one group
                }
            },
            include: {
                groups: true,
                payments: {
                    where: {
                        monthYear: monthYear
                    }
                }
            }
        });

        // 2. Filter students who haven't paid for the specified month
        const overdueStudents = students
            .filter(student => {
                // Calculate total expected fee (sum of monthly fees for all groups)
                const expectedFee = student.groups.reduce((sum, group) => sum + group.monthlyFee, 0);

                // If fee is 0, skip
                if (expectedFee === 0) return false;

                // Calculate total paid
                const totalPaid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);

                // Return true if underpaid
                return totalPaid < expectedFee;
            })
            .map(student => {
                const expectedFee = student.groups.reduce((sum, group) => sum + group.monthlyFee, 0);
                const totalPaid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);

                return {
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    groupNames: student.groups.map(g => g.name).join(', '),
                    amountDue: expectedFee - totalPaid,
                    month: monthYear
                };
            });

        return NextResponse.json(overdueStudents);

    } catch (error) {
        console.error('Error fetching overdue payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch overdue payments' },
            { status: 500 }
        );
    }
}
