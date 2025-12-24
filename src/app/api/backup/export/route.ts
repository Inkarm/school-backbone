import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizedRoute } from '@/lib/api-handler';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export const GET = authorizedRoute(async (req) => {
    try {
        // 1. Fetch all data
        const [
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
            announcementReactions
        ] = await Promise.all([
            prisma.user.findMany(),
            prisma.student.findMany(),
            prisma.group.findMany(),
            prisma.scheduleEvent.findMany(),
            prisma.recurringSchedule.findMany(),
            prisma.room.findMany(),
            prisma.attendance.findMany(),
            prisma.payment.findMany(),
            prisma.invoice.findMany(),
            prisma.announcement.findMany(),
            prisma.announcementRead.findMany(),
            prisma.announcementComment.findMany(),
            prisma.announcementReaction.findMany()
        ]);

        // Fetch implicit M-N relation table _StudentGroups
        // Note: Raw query is needed for implicit tables
        const studentGroups = await prisma.$queryRaw`SELECT * FROM "_StudentGroups"`;
        const trainerAccessibleGroups = await prisma.$queryRaw`SELECT * FROM "_TrainerAccessibleGroups"`;

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
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
                // Relations
                studentGroups,
                trainerAccessibleGroups
            }
        };

        const jsonString = JSON.stringify(backupData);
        const originalSize = Buffer.byteLength(jsonString);

        // 2. Compress data
        const compressedData = await gzipAsync(Buffer.from(jsonString));

        // 3. Save to Backup table (Automatic Retention: Delete older than 7 days)
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - 7);

        await prisma.$transaction([
            // Cleanup old backups
            (prisma as any).backup.deleteMany({
                where: {
                    createdAt: {
                        lt: retentionDate
                    }
                }
            }),
            // Create new backup
            (prisma as any).backup.create({
                data: {
                    name: `Backup ${new Date().toISOString()}`,
                    data: compressedData,
                    size: originalSize
                }
            })
        ]);

        // 4. Return the file for download (optional, UI can also just trigger creation)
        return new NextResponse(jsonString, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="school-backup-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });

    } catch (error) {
        console.error('Export failed:', error);
        return NextResponse.json(
            { error: 'Failed to create backup' },
            { status: 500 }
        );
    }
}, { roles: ['ADMIN'] });
