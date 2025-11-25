import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateAttendanceCSV } from '@/lib/attendanceHelpers';

// GET /api/attendance/export?groupId=X&startDate=Y&endDate=Z
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!groupId) {
            return NextResponse.json(
                { error: 'groupId is required' },
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

        // Fetch attendance records with event and student details
        const attendance = await prisma.attendance.findMany({
            where: {
                event: {
                    groupId: parseInt(groupId),
                    ...(Object.keys(dateFilter).length > 0 && {
                        date: dateFilter,
                    }),
                },
            },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                event: {
                    select: {
                        id: true,
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
            orderBy: [
                {
                    event: {
                        date: 'desc',
                    },
                },
                {
                    student: {
                        lastName: 'asc',
                    },
                },
            ],
        });

        // Generate CSV
        const csv = generateAttendanceCSV(attendance);

        // Generate filename with date range
        const filename = `obecnosc_grupa_${groupId}${startDate ? `_od_${startDate}` : ''}${endDate ? `_do_${endDate}` : ''}.csv`;

        // Return CSV as downloadable file
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Error exporting attendance:', error);
        return NextResponse.json(
            { error: 'Failed to export attendance', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
