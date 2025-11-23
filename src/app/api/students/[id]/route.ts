import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = parseInt(id);

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                groups: true,
                payments: {
                    orderBy: {
                        paymentDate: 'desc',
                    },
                    take: 10,
                },
            },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        return NextResponse.json(
            { error: 'Failed to fetch student' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = parseInt(id);
        const body = await request.json();
        const { firstName, lastName, dateOfBirth, parentName, parentPhone, parentEmail, healthNotes } = body;

        const student = await prisma.student.update({
            where: { id: studentId },
            data: {
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                parentName,
                parentPhone,
                parentEmail,
                healthNotes,
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = parseInt(id);

        await prisma.student.delete({
            where: { id: studentId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting student:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}
