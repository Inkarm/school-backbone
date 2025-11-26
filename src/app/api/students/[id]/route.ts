import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const studentId = parseInt(id);

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                groups: true,
                attendance: {
                    orderBy: {
                        event: {
                            date: 'desc'
                        }
                    },
                    take: 10,
                    include: {
                        event: true
                    }
                },
                payments: {
                    orderBy: {
                        paymentDate: 'desc'
                    },
                    take: 5
                }
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student details' },
            { status: 500 }
        );
    }
}

// DELETE - Hard delete student
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const studentId = parseInt(id);

        await prisma.student.delete({
            where: { id: studentId },
        });

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { error: 'Failed to delete student. Check associated data (payments, invoices).' },
            { status: 500 }
        );
    }
}

// PATCH - Update status (Suspend/Activate)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const studentId = parseInt(id);
        const body = await request.json();
        const { status } = body;

        if (!['ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: { status },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error updating student status:', error);
        return NextResponse.json(
            { error: 'Failed to update student status' },
            { status: 500 }
        );
    }
}
