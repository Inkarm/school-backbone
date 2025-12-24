import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);

export const POST = authorizedRoute(async (req) => {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let jsonString: string;

        // Try to decompress if it looks like gzip (magic number 1f 8b)
        if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
            const decompressed = await gunzipAsync(buffer);
            jsonString = decompressed.toString();
        } else {
            // Assume valid JSON if not compressed
            jsonString = buffer.toString();
        }

        const backup = JSON.parse(jsonString);

        if (!backup.data || !backup.version) {
            return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
        }

        const {
            users,
            students,
            groups,
            scheduleEvents,
            recurringSchedules,
            rooms,
            attendance,
            payments,
            invoices,
            announcements,
            announcementReads,
            announcementComments,
            announcementReactions,
            studentGroups,
            trainerAccessibleGroups
        } = backup.data;

        await prisma.$transaction(async (tx) => {
            // --- DELETE PHASE (Reverse Dependency) ---

            // 1. Clean explicit relations
            await tx.announcementReaction.deleteMany();
            await tx.announcementComment.deleteMany();
            await tx.announcementRead.deleteMany();
            await tx.announcement.deleteMany();

            await tx.attendance.deleteMany();
            await tx.payment.deleteMany();
            await tx.invoice.deleteMany();

            await tx.scheduleEvent.deleteMany();
            await tx.recurringSchedule.deleteMany();

            // 2. Clean implicit relations (Using Raw SQL)
            await tx.$executeRaw`TRUNCATE TABLE "_StudentGroups" CASCADE`;
            await tx.$executeRaw`TRUNCATE TABLE "_TrainerAccessibleGroups" CASCADE`;

            // 3. Clean Core tables
            await tx.group.deleteMany();
            await tx.student.deleteMany();
            await tx.room.deleteMany();
            await tx.user.deleteMany();

            // --- RESTORE PHASE (Dependency Order) ---

            // 1. Core Users & Context
            if (users?.length) await tx.user.createMany({ data: users });
            if (rooms?.length) await tx.room.createMany({ data: rooms });

            // 2. Core Entities
            if (students?.length) {
                await tx.student.createMany({ data: students });
            }
            if (groups?.length) await tx.group.createMany({ data: groups });

            // 3. Restore Relations
            if (studentGroups?.length) {
                for (const rel of studentGroups) {
                    await tx.$executeRaw`INSERT INTO "_StudentGroups" ("A", "B") VALUES (${rel.A}, ${rel.B})`;
                }
            }
            if (trainerAccessibleGroups?.length) {
                for (const rel of trainerAccessibleGroups) {
                    await tx.$executeRaw`INSERT INTO "_TrainerAccessibleGroups" ("A", "B") VALUES (${rel.A}, ${rel.B})`;
                }
            }

            // 4. Operational Data
            if (recurringSchedules?.length) await tx.recurringSchedule.createMany({ data: recurringSchedules });
            if (scheduleEvents?.length) await tx.scheduleEvent.createMany({ data: scheduleEvents });

            // 5. Financials & Logs
            if (invoices?.length) await tx.invoice.createMany({ data: invoices });
            if (payments?.length) await tx.payment.createMany({ data: payments });
            if (attendance?.length) await tx.attendance.createMany({ data: attendance });

            // 6. Communications
            if (announcements?.length) await tx.announcement.createMany({ data: announcements });
            if (announcementReads?.length) await tx.announcementRead.createMany({ data: announcementReads });
            if (announcementComments?.length) await tx.announcementComment.createMany({ data: announcementComments });
            if (announcementReactions?.length) await tx.announcementReaction.createMany({ data: announcementReactions });

        });

        return NextResponse.json({ success: true, message: 'Restore complete' });

    } catch (error) {
        console.error('Import failed:', error);
        return NextResponse.json(
            { error: 'Failed to restore backup: ' + (error as Error).message },
            { status: 500 }
        );
    }
}, { roles: ['ADMIN'] });
