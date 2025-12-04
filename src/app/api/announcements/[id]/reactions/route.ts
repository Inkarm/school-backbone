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

    try {
        const body = await request.json();
        const { emoji } = body;

        if (!emoji) {
            return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
        }

        const userId = parseInt(session.user.id);

        // Check if reaction exists
        const existing = await prisma.announcementReaction.findUnique({
            where: {
                announcementId_userId_emoji: {
                    announcementId,
                    userId,
                    emoji
                }
            }
        });

        if (existing) {
            // Toggle off (delete)
            await prisma.announcementReaction.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add new
            await prisma.announcementReaction.create({
                data: {
                    announcementId,
                    userId,
                    emoji
                }
            });
            return NextResponse.json({ action: 'added' });
        }
    } catch (error) {
        console.error('Error toggling reaction:', error);
        return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
    }
}
