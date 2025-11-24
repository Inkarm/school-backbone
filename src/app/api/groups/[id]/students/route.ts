import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const groupId = parseInt(id);
        const body = await request.json();
        const { studentId } = body;

        if (isNaN(groupId) || !studentId) {
            return NextResponse.json(
                { error: 'Invalid group ID or student ID' },
                { status: 400 }
            );
        }

        const group = await prisma.group.update({
            where: { id: groupId },
            data: {
                students: {
                    connect: { id: studentId }
                }
            }
        });

        return NextResponse.json(group);
    } catch (error: any) {
        console.error('Error adding student to group:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to add student to group' },
            { status: 500 }
        );
    }
}
