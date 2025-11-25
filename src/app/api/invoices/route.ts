import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');
        const month = searchParams.get('month'); // YYYY-MM

        const where: any = {};

        if (studentId) where.studentId = parseInt(studentId);
        if (status) where.status = status;
        if (month) {
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            where.issueDate = {
                gte: startDate,
                lt: endDate,
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        parentName: true,
                        parentEmail: true,
                    }
                }
            },
            orderBy: {
                issueDate: 'desc',
            },
        });

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { studentId, issueDate, dueDate, items } = body;

        if (!studentId || !issueDate || !dueDate || !items || !Array.isArray(items)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Calculate total amount
        const amount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.price);
        }, 0);

        // Generate Invoice Number (Simple sequential: INV/YYYY/ID)
        // We need to get the next ID first or use a transaction. 
        // For simplicity in MVP, we'll use a transaction to count existing invoices for the year or just use auto-increment ID in the number.

        const year = new Date(issueDate).getFullYear();

        const invoice = await prisma.$transaction(async (tx) => {
            // Count invoices for this year to generate sequential number
            const count = await tx.invoice.count({
                where: {
                    issueDate: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`),
                    }
                }
            });

            const number = `INV/${year}/${(count + 1).toString().padStart(3, '0')}`;

            return tx.invoice.create({
                data: {
                    number,
                    studentId: parseInt(studentId),
                    issueDate: new Date(issueDate),
                    dueDate: new Date(dueDate),
                    amount,
                    status: 'ISSUED',
                    items: items, // Prisma handles Json type
                },
            });
        });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
