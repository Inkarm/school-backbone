import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const trainers = await prisma.user.findMany({
            where: {
                role: 'TRAINER',
            },
            select: {
                id: true,
                login: true,
                role: true,
            },
        });

        return NextResponse.json(trainers);
    } catch (error) {
        console.error('Error fetching trainers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trainers' },
            { status: 500 }
        );
    }
}
