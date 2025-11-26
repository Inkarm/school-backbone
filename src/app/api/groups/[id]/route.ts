import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
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
    } catch (error) {
        console.error('Error fetching group:', error);
        return NextResponse.json(
            { error: 'Failed to fetch group details' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const groupId = parseInt(id);

        // Check if group exists
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { _count: { select: { students: true, scheduleEvents: true } } }
        });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Optional: Prevent deletion if there are associated students or events
        // For now, we'll allow it but maybe we should warn? 
        // Let's assume hard delete is what's requested, but Prisma might throw foreign key errors 
        // if we don't handle relations. 
        // The schema doesn't have Cascade delete on all relations.

        // Let's try to delete. If it fails due to constraints, we'll return an error.
        await prisma.group.delete({
            where: { id: groupId },
        });

        return NextResponse.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json(
            { error: 'Failed to delete group. It might have associated data.' },
            { status: 500 }
        );
    }
}
