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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const groupId = parseInt(id);
        const searchParams = request.nextUrl.searchParams;
        const studentId = parseInt(searchParams.get('studentId') || '');

        if (isNaN(groupId) || isNaN(studentId)) {
            return NextResponse.json(
                { error: 'Invalid group ID or student ID' },
                { status: 400 }
            );
        }

        const group = await prisma.group.update({
            where: { id: groupId },
            data: {
                students: {
                    disconnect: { id: studentId }
                }
            }
        });

        return NextResponse.json(group);
    } catch (error: any) {
        console.error('Error removing student from group:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove student from group' },
            { status: 500 }
        );
    }
}
