import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Fixes ---');

    // 1. Verify Schedule Date Query Logic
    console.log('\n1. Testing Schedule Date Query...');

    // Create a group and trainer
    const group = await prisma.group.create({ data: { name: 'Test Group Fix' } });
    const trainer = await prisma.user.findFirst({ where: { role: 'TRAINER' } }) ||
        await prisma.user.create({ data: { login: 'fix_trainer', password: 'p', role: 'TRAINER' } });

    // Simulate AddClassModal sending "2025-11-24"
    const dateString = "2025-11-24";
    const eventDate = new Date(dateString); // UTC midnight
    console.log('Event Date (DB):', eventDate.toISOString());

    const event = await prisma.scheduleEvent.create({
        data: {
            date: eventDate,
            startTime: '10:00',
            endTime: '11:00',
            groupId: group.id,
            trainerId: trainer.id,
            status: 'SCHEDULED'
        }
    });

    // Simulate CalendarView fetching
    // Case 1: Current time is late in the day (e.g. 22:00)
    const now = new Date("2025-11-24T22:00:00");

    // Logic from BEFORE fix (simulated)
    const d_bad = new Date(now);
    const day_bad = d_bad.getDay();
    const diff_bad = d_bad.getDate() - day_bad + (day_bad === 0 ? -6 : 1);
    const monday_bad = new Date(d_bad.setDate(diff_bad)); // Keeps 22:00
    console.log('Old Logic StartDate:', monday_bad.toISOString());

    // Logic AFTER fix
    const d_good = new Date(now);
    const day_good = d_good.getDay();
    const diff_good = d_good.getDate() - day_good + (day_good === 0 ? -6 : 1);
    d_good.setDate(diff_good);
    d_good.setHours(0, 0, 0, 0); // Reset to 00:00
    const monday_good = d_good;
    console.log('New Logic StartDate:', monday_good.toISOString());

    // Query using New Logic
    const foundEvents = await prisma.scheduleEvent.findMany({
        where: {
            date: {
                gte: monday_good
            }
        }
    });

    const found = foundEvents.find(e => e.id === event.id);
    if (found) {
        console.log('✅ Event found with new logic!');
    } else {
        console.error('❌ Event NOT found with new logic!');
    }

    // Cleanup
    await prisma.scheduleEvent.delete({ where: { id: event.id } });
    await prisma.group.delete({ where: { id: group.id } });
    if (trainer.login === 'fix_trainer') await prisma.user.delete({ where: { id: trainer.id } });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
