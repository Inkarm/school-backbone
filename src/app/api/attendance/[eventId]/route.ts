import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const id = parseInt(eventId);

        // 1. Get the event to find the group
        const event = await prisma.scheduleEvent.findUnique({
            where: { id },
            include: {
                group: {
                    include: {
                        students: {
                            orderBy: { lastName: 'asc' }
                        }
                    }
                }
            }
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // 2. Get existing attendance records for this event
        const attendanceRecords = await prisma.attendance.findMany({
            where: { eventId: id },
        });

        // 3. Merge students with their attendance status
        // If no record exists, status is null (or we can default to 'present' or 'unknown')
        const studentsWithAttendance = event.group.students.map(student => {
            const record = attendanceRecords.find(r => r.studentId === student.id);
            return {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                present: record ? record.present : null, // null means not yet checked
            };
        });

        return NextResponse.json({
            event: {
                id: event.id,
                date: event.date,
                startTime: event.startTime,
                endTime: event.endTime,
                groupName: event.group.name,
            },
            students: studentsWithAttendance,
        });

    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}
