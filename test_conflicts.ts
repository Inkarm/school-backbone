import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Room Conflicts ---');

    // Setup
    const group = await prisma.group.create({ data: { name: 'Conflict Test Group' } });
    const trainer = await prisma.user.findFirst({ where: { role: 'trainer' } }) ||
        await prisma.user.create({ data: { login: 'conflict_trainer', password: 'p', role: 'trainer' } });
    const room = await prisma.room.create({ data: { name: 'Conflict Room', capacity: 10 } });

    const date = new Date("2025-11-25"); // Tuesday

    // 1. Create Initial Event (10:00 - 11:00)
    console.log('\n1. Creating Initial Event...');
    await prisma.scheduleEvent.create({
        data: {
            date,
            startTime: '10:00',
            endTime: '11:00',
            groupId: group.id,
            trainerId: trainer.id,
            roomId: room.id,
            status: 'SCHEDULED'
        }
    });
    console.log('✅ Created event 10:00-11:00 in Room', room.id);

    // 2. Try to create conflicting event (10:30 - 11:30) - Should Fail
    console.log('\n2. Testing Conflict (10:30-11:30)...');
    const conflictCheck = await prisma.scheduleEvent.findFirst({
        where: {
            roomId: room.id,
            date,
            status: { not: 'CANCELLED' },
            OR: [
                { startTime: { lte: '10:30' }, endTime: { gt: '10:30' } }, // New starts during existing
                { startTime: { lt: '11:30' }, endTime: { gte: '11:30' } }, // New ends during existing
                { startTime: { gte: '10:30' }, endTime: { lte: '11:30' } }  // New encloses existing
            ]
        }
    });

    if (conflictCheck) {
        console.log('✅ Conflict correctly detected!');
    } else {
        console.error('❌ Conflict NOT detected!');
    }

    // 3. Try to create non-conflicting event (11:00 - 12:00) - Should Pass
    console.log('\n3. Testing Non-Conflict (11:00-12:00)...');
    const nonConflictCheck = await prisma.scheduleEvent.findFirst({
        where: {
            roomId: room.id,
            date,
            status: { not: 'CANCELLED' },
            OR: [
                { startTime: { lte: '11:00' }, endTime: { gt: '11:00' } },
                { startTime: { lt: '12:00' }, endTime: { gte: '12:00' } },
                { startTime: { gte: '11:00' }, endTime: { lte: '12:00' } }
            ]
        }
    });

    if (!nonConflictCheck) {
        console.log('✅ No conflict detected (correct)!');
    } else {
        console.error('❌ False positive conflict detected!');
    }

    // Cleanup
    await prisma.scheduleEvent.deleteMany({ where: { groupId: group.id } });
    await prisma.group.delete({ where: { id: group.id } });
    await prisma.room.delete({ where: { id: room.id } });
    if (trainer.login === 'conflict_trainer') await prisma.user.delete({ where: { id: trainer.id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
