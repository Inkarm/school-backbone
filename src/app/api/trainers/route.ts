import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const trainers = await prisma.user.findMany({
            where: {
                role: 'trainer',
            },
            select: {
                id: true,
                login: true,
                // Add other fields if User model has name, etc. For now login is the name.
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
