import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req, { session }) => {
    const userRole = session.user?.role;
    const userId = session.user?.id ? parseInt(session.user.id) : null;

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
            defaultTrainer: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    return NextResponse.json(groups);
});

export const POST = authorizedRoute(async (req) => {
    const body = await req.json();
    const { name, monthlyFee } = body;

    const group = await prisma.group.create({
        data: {
            name,
            monthlyFee: monthlyFee ? parseFloat(monthlyFee) : 0,
        },
    });

    return NextResponse.json(group, { status: 201 });
});
