import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const pinnedOnly = searchParams.get('pinnedOnly') === 'true';

        const whereClause: any = {};
        if (pinnedOnly) {
            whereClause.isPinned = true;
        }

        const announcements = await prisma.announcement.findMany({
            where: whereClause,
            orderBy: [
                { isPinned: 'desc' }, // Pinned first
                { createdAt: 'desc' } // Then newest
            ],
            take: limit,
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        login: true,
                    }
                },
                reads: {
                    where: {
                        userId: parseInt(session.user.id)
                    }
                }
            }
        });

        // Transform to include 'isRead' flag
        const transformed = announcements.map((a: any) => ({
            ...a,
            isRead: a.reads.length > 0
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, content, priority, isPinned } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority: priority || 'INFO',
                isPinned: isPinned || false,
                authorId: parseInt(session.user.id)
            }
        });

        return NextResponse.json(announcement, { status: 201 });
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }
}
