import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { auth } from '@/auth';

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userRole = session?.user?.role;
        const userId = session?.user?.id ? parseInt(session.user.id) : null;

        let whereClause: any = {};

        if (userRole === 'TRAINER' && userId) {
            // Fetch fresh user data to get access level
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { accessibleGroups: true } // For Level 3
            });

            if (user) {
                if (user.accessLevel === 1) {
                    // Level 1: Only own groups
                    whereClause = { defaultTrainerId: userId };
                } else if (user.accessLevel === 3) {
                    // Level 3: Own groups + Accessible groups
                    whereClause = {
                        OR: [
                            { defaultTrainerId: userId },
                            { id: { in: user.accessibleGroups.map((g: { id: number }) => g.id) } }
                        ]
                    };
                }
                // Level 2 (Manager): No filter (sees all)
            }
        }

        const groups = await prisma.group.findMany({
            where: whereClause,
            include: {
                students: true,
                defaultTrainer: true, // Include trainer info
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        return NextResponse.json(
            { error: 'Failed to fetch groups' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, monthlyFee } = body;

        const group = await prisma.group.create({
            data: {
                name,
                monthlyFee: monthlyFee ? parseFloat(monthlyFee) : 0,
            },
        });

        return NextResponse.json(group, { status: 201 });
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json(
            { error: 'Failed to create group' },
            { status: 500 }
        );
    }
}
