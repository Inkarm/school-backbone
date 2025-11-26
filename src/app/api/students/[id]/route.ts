import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const studentId = parseInt(id);

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            groups: true,
            attendance: {
                orderBy: {
                    event: {
                        date: 'desc'
                    }
                },
                take: 10,
                include: {
                    event: true
                }
            },
            payments: {
                orderBy: {
                    paymentDate: 'desc'
                },
                take: 5
            }
        }
    });

    if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
});

export const DELETE = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const studentId = parseInt(id);

    await prisma.student.delete({
        where: { id: studentId },
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
}, { roles: ['ADMIN'] });

export const PATCH = authorizedRoute(async (req, { params }) => {
    const { id } = await params;
    const studentId = parseInt(id);
    const body = await req.json();
    const { status } = body;

    if (!['ACTIVE', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const student = await prisma.student.update({
        where: { id: studentId },
        data: { status },
    });

    return NextResponse.json(student);
}, { roles: ['ADMIN'] });
