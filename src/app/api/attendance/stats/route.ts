import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/attendance/stats?studentId=X&startDate=Y&endDate=Z
// GET /api/attendance/stats?groupId=X&startDate=Y&endDate=Z
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const groupId = searchParams.get('groupId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!studentId && !groupId) {
            return NextResponse.json(
                { error: 'Either studentId or groupId is required' },
                { status: 400 }
            );
        }

        // Build date filter
        const dateFilter: any = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.lte = end;
        }

        if (studentId) {
            // Student-specific stats
            const attendance = await prisma.attendance.findMany({
                where: {
                    studentId: parseInt(studentId),
                    ...(Object.keys(dateFilter).length > 0 && {
                        event: {
                            date: dateFilter,
                        },
                    }),
                },
                include: {
                    event: {
                        select: {
                            date: true,
                            startTime: true,
                            group: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    event: {
                        date: 'desc',
                    },
                },
            });

            const totalClasses = attendance.length;
            const attendedClasses = attendance.filter(a => a.present).length;
            const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

            // Monthly breakdown
            const monthlyStats = attendance.reduce((acc: any, record) => {
                const month = record.event.date.toISOString().slice(0, 7); // YYYY-MM
                if (!acc[month]) {
                    acc[month] = { total: 0, attended: 0 };
                }
                acc[month].total++;
                if (record.present) {
                    acc[month].attended++;
                }
                return acc;
            }, {});

            const monthly = Object.entries(monthlyStats).map(([month, stats]: [string, any]) => ({
                month,
                total: stats.total,
                attended: stats.attended,
                percentage: (stats.attended / stats.total) * 100,
            }));

            return NextResponse.json({
                totalClasses,
                attendedClasses,
                attendanceRate: Math.round(attendanceRate * 10) / 10,
                monthly,
                recentAttendance: attendance.slice(0, 10).map(a => ({
                    date: a.event.date,
                    startTime: a.event.startTime,
                    groupName: a.event.group.name,
                    present: a.present,
                })),
            });
        } else {
            // Group-specific stats
            const events = await prisma.scheduleEvent.findMany({
                where: {
                    groupId: parseInt(groupId!),
                    ...(Object.keys(dateFilter).length > 0 && {
                        date: dateFilter,
                    }),
                },
                include: {
                    attendance: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    group: {
                        include: {
                            students: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });

            const totalEvents = events.length;
            let totalAttendanceRecords = 0
                ;
            let totalPresent = 0;

            // Calculate per-student statistics
            const studentStats: Record<number, { name: string; total: number; attended: number }> = {};

            events.forEach(event => {
                event.attendance.forEach(record => {
                    const student = record.student;
                    if (!studentStats[student.id]) {
                        studentStats[student.id] = {
                            name: `${student.firstName} ${student.lastName}`,
                            total: 0,
                            attended: 0,
                        };
                    }
                    studentStats[student.id].total++;
                    if (record.present) {
                        studentStats[student.id].attended++;
                        totalPresent++;
                    }
                    totalAttendanceRecords++;
                });
            });

            const overallRate = totalAttendanceRecords > 0
                ? (totalPresent / totalAttendanceRecords) * 100
                : 0;

            const students = Object.entries(studentStats).map(([id, stats]) => ({
                studentId: parseInt(id),
                name: stats.name,
                total: stats.total,
                attended: stats.attended,
                attendanceRate: (stats.attended / stats.total) * 100,
            }));

            return NextResponse.json({
                groupId: parseInt(groupId!),
                totalEvents,
                overallAttendanceRate: Math.round(overallRate * 10) / 10,
                students: students.sort((a, b) => b.attendanceRate - a.attendanceRate),
            });
        }
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch attendance stats', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
