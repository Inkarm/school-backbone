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
        const groupId = searchParams.get('groupId');
        const month = searchParams.get('month'); // YYYY-MM

        if (!groupId || !month) {
            return NextResponse.json(
                { error: 'Missing groupId or month' },
                { status: 400 }
            );
        }

        // Fetch group details (for rate) and students with their payments for the month
        const group = await prisma.group.findUnique({
            where: { id: parseInt(groupId) },
            include: {
                students: {
                    include: {
                        payments: {
                            where: {
                                monthYear: month,
                            }
                        }
                    },
                    orderBy: {
                        lastName: 'asc',
                    }
                }
            }
        });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Transform data
        const summary = group.students.map(student => {
            const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
            const monthlyFee = group.monthlyFee || 0;

            let status = 'UNPAID';
            if (totalPaid >= monthlyFee && monthlyFee > 0) {
                status = 'PAID';
            } else if (totalPaid > 0) {
                status = 'PARTIAL';
            }

            return {
                student: {
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    parentName: student.parentName,
                    parentPhone: student.parentPhone,
                },
                totalPaid,
                payments: student.payments,
                status,
                monthlyFee
            };
        });

        return NextResponse.json({
            groupName: group.name,
            ratePerClass: group.ratePerClass,
            monthlyFee: group.monthlyFee,
            summary
        });

    } catch (error) {
        console.error('Error fetching group summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch summary' },
            { status: 500 }
        );
    }
}
