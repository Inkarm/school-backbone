import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/attendance?eventId=X
// Get attendance records for a specific event
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId is required' },
                { status: 400 }
            );
        }

        // Fetch all attendance records for the event
        const attendance = await prisma.attendance.findMany({
            where: {
                eventId: parseInt(eventId),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        // parentName: true, // Removed as it was not in original select
                    },
                },
            },
            orderBy: {
                student: {
                    lastName: 'asc',
                },
            },
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}

// POST /api/attendance
// Bulk save/update attendance for an event
// Body: { eventId: number, attendance: [{ studentId: number, present: boolean }] }
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { eventId, attendance } = body;

        if (!eventId || !attendance || !Array.isArray(attendance)) {
            return NextResponse.json(
                { error: 'eventId and attendance array are required' },
                { status: 400 }
            );
        }

        // Verify event exists
        const event = await prisma.scheduleEvent.findUnique({
            where: { id: eventId },
            include: {
                group: {
                    include: {
                        students: true,
                    },
                },
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Verify all students belong to the event's group
        const groupStudentIds = event.group.students.map(s => s.id);
        const invalidStudents = attendance.filter(
            a => !groupStudentIds.includes(a.studentId)
        );

        if (invalidStudents.length > 0) {
            return NextResponse.json(
                { error: 'Some students do not belong to this group' },
                { status: 400 }
            );
        }

        // Bulk upsert attendance records
        const results = await Promise.all(
            attendance.map(({ studentId, present }) =>
                prisma.attendance.upsert({
                    where: {
                        studentId_eventId: {
                            studentId,
                            eventId,
                        },
                    },
                    update: {
                        present,
                        updatedAt: new Date(),
                    },
                    create: {
                        studentId,
                        eventId,
                        present,
                    },
                })
            )
        );

        return NextResponse.json({
            message: 'Attendance saved successfully',
            count: results.length,
        });
    } catch (error) {
        console.error('Error saving attendance:', error);
        return NextResponse.json(
            { error: 'Failed to save attendance', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
