import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const announcementId = parseInt(id);
    const userId = parseInt(session.user.id);

    try {
        // Check if already read
        const existing = await prisma.announcementRead.findUnique({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: 'Already read' });
        }

        await prisma.announcementRead.create({
            data: {
                announcementId,
                userId
            }
        });

        return NextResponse.json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Error marking announcement as read:', error);
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
    }
}
