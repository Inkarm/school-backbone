import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Default to current month if not specified
        const now = new Date();
        const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch all rooms
        const rooms = await prisma.room.findMany({
            include: {
                events: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate,
                        },
                        status: {
                            not: 'CANCELLED'
                        }
                    }
                }
            }
        });

        const data = rooms.map(room => {
            // Calculate total hours booked
            let totalMinutes = 0;

            room.events.forEach(event => {
                const [startHour, startMin] = event.startTime.split(':').map(Number);
                const [endHour, endMin] = event.endTime.split(':').map(Number);

                const start = startHour * 60 + startMin;
                const end = endHour * 60 + endMin;

                totalMinutes += (end - start);
            });

            const hoursBooked = Math.round((totalMinutes / 60) * 10) / 10;

            return {
                name: room.name,
                hours: hoursBooked,
                capacity: room.capacity,
                eventsCount: room.events.length
            };
        }).sort((a, b) => b.hours - a.hours);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching room utilization stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch room utilization stats' },
            { status: 500 }
        );
    }
}
