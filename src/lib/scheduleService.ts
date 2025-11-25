import prisma from '@/lib/prisma';

export async function updatePastEventsStatus() {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTime = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    try {
        // 1. Update events from previous days that are still SCHEDULED
        await prisma.scheduleEvent.updateMany({
            where: {
                status: 'SCHEDULED',
                date: {
                    lt: currentDate,
                },
            },
            data: {
                status: 'COMPLETED',
            },
        });

        // 2. Update events from TODAY that have already ended
        // This is trickier because endTime is a string "HH:mm"
        // We can fetch today's scheduled events and filter in JS, then update individually or by ID list
        const todayEvents = await prisma.scheduleEvent.findMany({
            where: {
                status: 'SCHEDULED',
                date: {
                    equals: currentDate,
                },
            },
        });

        const eventsToComplete = todayEvents.filter(event => {
            return event.endTime < currentTime;
        });

        if (eventsToComplete.length > 0) {
            await prisma.scheduleEvent.updateMany({
                where: {
                    id: {
                        in: eventsToComplete.map(e => e.id),
                    },
                },
                data: {
                    status: 'COMPLETED',
                },
            });
        }
    } catch (error) {
        console.error('Error auto-completing events:', error);
    }
}
