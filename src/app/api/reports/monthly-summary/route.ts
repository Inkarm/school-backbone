import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month'); // YYYY-MM

        let startDate, endDate;

        if (monthParam) {
            const [year, month] = monthParam.split('-').map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
        } else {
            // Default to current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        // Fetch events with attendance and group details
        const events = await prisma.scheduleEvent.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { not: 'CANCELLED' } // Only count active classes for stats? Or show cancelled too?
                // Usually reports show what happened. Cancelled classes might be interesting but shouldn't count towards attendance stats.
                // Let's fetch all and filter in memory or separate queries if needed.
                // For now, let's fetch everything but maybe filter cancelled for attendance calc.
            },
            include: {
                group: {
                    include: {
                        students: true // Need total students in group to calc %
                    }
                },
                trainer: true,
                room: true,
                attendance: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Calculate Stats
        let totalClasses = 0;
        let totalPresentVolume = 0;
        const uniqueStudents = new Set<number>();
        let totalAttendancePercentageSum = 0;
        let classesWithAttendance = 0;

        const detailedEvents = events.map(event => {
            const isCancelled = event.status === 'CANCELLED';
            if (!isCancelled) totalClasses++;

            const presentCount = event.attendance.filter(a => a.present).length;
            const totalStudents = event.group?.students?.length || 0;

            // Filter active students only? 
            // Ideally attendance records already exist. If we use event.group.students, it includes current students.
            // But for past events, the group size might have been different.
            // However, we can only rely on current group size or the number of attendance records created.
            // If attendance records exist, use them as the denominator?
            // Attendance records are created for all students in the group at that time (if we implemented it that way).
            // But our AttendanceMarker creates records for ALL students.
            // So event.attendance.length is the denominator if attendance was taken.

            const attendanceTaken = event.attendance.length > 0;
            const denominator = attendanceTaken ? event.attendance.length : totalStudents;

            const percentage = denominator > 0 ? Math.round((presentCount / denominator) * 100) : 0;

            if (!isCancelled && attendanceTaken) {
                totalPresentVolume += presentCount;
                event.attendance.filter(a => a.present).forEach(a => uniqueStudents.add(a.studentId));
                totalAttendancePercentageSum += percentage;
                classesWithAttendance++;
            }

            return {
                id: event.id,
                date: event.date,
                startTime: event.startTime,
                endTime: event.endTime,
                groupName: event.group?.name || 'Unknown',
                trainerName: event.trainer ? `${event.trainer.firstName} ${event.trainer.lastName}` : 'Unknown',
                roomName: event.room?.name || 'No Room',
                status: event.status,
                presentCount,
                totalCount: denominator,
                percentage,
                attendanceTaken
            };
        });

        const avgAttendance = classesWithAttendance > 0
            ? Math.round(totalAttendancePercentageSum / classesWithAttendance)
            : 0;

        return NextResponse.json({
            stats: {
                totalClasses,
                totalPresentVolume,
                uniqueStudents: uniqueStudents.size,
                avgAttendance
            },
            events: detailedEvents
        });

    } catch (error) {
        console.error('Error fetching monthly report:', error);
        return NextResponse.json(
            { error: 'Failed to fetch report data' },
            { status: 500 }
        );
    }
}
