import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const groupId = parseInt(id);

    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            students: true,
            defaultTrainer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    login: true,
                }
            },
            scheduleEvents: {
                where: {
                    date: {
                        gte: new Date(),
                    }
                },
                orderBy: {
                    date: 'asc',
                },
                take: 5,
                include: {
                    room: true,
                }
            }
        }
    });

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
});

export const DELETE = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const groupId = parseInt(id);

    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Transactional delete: Manually delete related events/schedules to ensure success
    // irrespective of Schema Cascade settings (Safety Net).
    await prisma.$transaction(async (tx) => {
        // Delete Future Events
        await tx.scheduleEvent.deleteMany({
            where: { groupId: groupId }
        });

        // Delete Recurring Series
        await tx.recurringSchedule.deleteMany({
            where: { groupId: groupId }
        });

        // Finally delete group
        await tx.group.delete({
            where: { id: groupId },
        });
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
}, { roles: ['ADMIN'] });
