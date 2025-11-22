import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, attendance } = body;

        // Delete existing attendance for this event
        await prisma.attendance.deleteMany({
            where: { eventId: parseInt(eventId) },
        });

        // Create new attendance records
        const attendanceRecords = await prisma.attendance.createMany({
            data: attendance.map((record: { studentId: number; status: string }) => ({
                eventId: parseInt(eventId),
                studentId: record.studentId,
                status: record.status,
                date: new Date(),
            })),
        });

        return NextResponse.json({ success: true, count: attendanceRecords.count });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json(
            { error: 'Failed to mark attendance' },
            { status: 500 }
        );
    }
}
