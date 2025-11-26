import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const series = await prisma.recurringSchedule.findMany({
            include: {
                group: true,
                trainer: true,
                room: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        return NextResponse.json(series);
    } catch (error) {
        console.error('Error fetching recurring schedules:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recurring schedules' },
            { status: 500 }
        );
    }
}
