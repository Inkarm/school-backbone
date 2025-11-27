import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const studentId = parseInt(id);

        if (isNaN(studentId)) {
            return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
        }

        // Fetch student with attendance records
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                attendance: {
                    include: {
                        event: {
                            include: {
                                group: true,
                                trainer: true
                            }
                        }
                    },
                    orderBy: {
                        event: {
                            date: 'desc'
                        }
                    }
                },
                groups: true
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Calculate stats
        const totalClasses = student.attendance.length;
        const presentCount = student.attendance.filter(a => a.present).length;
        const absentCount = totalClasses - presentCount; // Assuming record exists means they were expected
        const attendancePercentage = totalClasses > 0
            ? Math.round((presentCount / totalClasses) * 100)
            : 0;

        // Format history
        const history = student.attendance.map(record => ({
            id: record.id,
            date: record.event.date,
            startTime: record.event.startTime,
            endTime: record.event.endTime,
            groupName: record.event.group.name,
            trainerName: record.event.trainer.firstName
                ? `${record.event.trainer.firstName} ${record.event.trainer.lastName}`
                : record.event.trainer.login,
            present: record.present,
            status: record.event.status
        }));

        return NextResponse.json({
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                status: student.status,
                groups: student.groups
            },
            stats: {
                totalClasses,
                presentCount,
                absentCount,
                attendancePercentage
            },
            history
        });

    } catch (error) {
        console.error('Error fetching student attendance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance data' },
            { status: 500 }
        );
    }
}
