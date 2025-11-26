import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';

export const GET = authorizedRoute(async (req) => {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');

    const students = await prisma.student.findMany({
        where: search
            ? {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { parentName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : undefined,
        include: {
            groups: true,
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    return NextResponse.json(students);
});

export const POST = authorizedRoute(async (req) => {
    const body = await req.json();
    const { firstName, lastName, dateOfBirth, parentName, parentPhone, parentEmail, healthNotes } = body;

    const student = await prisma.student.create({
        data: {
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            parentName,
            parentPhone,
            parentEmail,
            healthNotes,
            status: 'ACTIVE',
        },
    });

    return NextResponse.json(student, { status: 201 });
});
