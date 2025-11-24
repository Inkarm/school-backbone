import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, attendance } = body;

        // attendance is an array of { studentId: number, status: string }

        if (!eventId || !Array.isArray(attendance)) {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            );
        }

        // Strategy: Delete all existing attendance for this event and re-create.
        // This handles updates and new records in one go, assuming the frontend sends the full state.
        // This avoids the need for a unique constraint on [eventId, studentId] for upsert,
        // although adding that constraint would be better practice in the long run.

        await prisma.$transaction([
            prisma.attendance.deleteMany({
                where: { eventId: parseInt(eventId) },
            }),
            prisma.attendance.createMany({
                data: attendance.map((r: any) => ({
                    eventId: parseInt(eventId),
                    studentId: r.studentId,
                    status: r.status,
                })),
            }),
        ]);

        return NextResponse.json({ message: 'Attendance saved successfully' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        return NextResponse.json(
            { error: 'Failed to save attendance' },
            { status: 500 }
        );
    }
}
