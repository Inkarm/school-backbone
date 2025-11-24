import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = parseInt(id);
        const body = await request.json();
        const { groupId } = body;

        if (isNaN(studentId) || !groupId) {
            return NextResponse.json(
                { error: 'Invalid student ID or group ID' },
                { status: 400 }
            );
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: {
                groups: {
                    connect: { id: groupId }
                }
            }
        });

        return NextResponse.json(student);
    } catch (error: any) {
        console.error('Error assigning group:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to assign group' },
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
        const studentId = parseInt(id);
        const body = await request.json();
        const { groupId } = body;

        if (isNaN(studentId) || !groupId) {
            return NextResponse.json(
                { error: 'Invalid student ID or group ID' },
                { status: 400 }
            );
        }

        const student = await prisma.student.update({
            where: { id: studentId },
            data: {
                groups: {
                    disconnect: { id: groupId }
                }
            }
        });

        return NextResponse.json(student);
    } catch (error: any) {
        console.error('Error removing group:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to remove group' },
            { status: 500 }
        );
    }
}
