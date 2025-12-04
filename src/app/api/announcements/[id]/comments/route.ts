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

    const { id } = await params;
    const announcementId = parseInt(id);

    try {
        const comments = await prisma.announcementComment.findMany({
            where: { announcementId },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        login: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

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
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await prisma.announcementComment.create({
            data: {
                content,
                announcementId,
                authorId: parseInt(session.user.id)
            },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        login: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
