import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Phase 2 Verification ---');

    // 1. Test Trainers (User Model)
    console.log('\n1. Testing Trainers...');
    const trainerLogin = `trainer_test_${Date.now()}`;

    // Create
    const trainer = await prisma.user.create({
        data: {
            login: trainerLogin,
            password: 'password123',
            role: 'trainer',
            firstName: 'Test',
            lastName: 'Trainer',
            email: 'test@example.com',
            color: '#ff0000'
        }
    });
    console.log('✅ Created trainer:', trainer.id, trainer.login);

    // Update
    const updatedTrainer = await prisma.user.update({
        where: { id: trainer.id },
        data: { bio: 'Updated Bio' }
    });
    console.log('✅ Updated trainer bio:', updatedTrainer.bio);

    // 2. Test Schedule Improvements
    console.log('\n2. Testing Schedule...');

    // Create a test group and room if needed (assuming they exist or creating dummy)
    const group = await prisma.group.create({
        data: { name: `Group ${Date.now()}` }
    });

    const event = await prisma.scheduleEvent.create({
        data: {
            date: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            groupId: group.id,
            trainerId: trainer.id,
            status: 'SCHEDULED'
        }
    });
    console.log('✅ Created event:', event.id, event.status);

    // Cancel Event
    const cancelledEvent = await prisma.scheduleEvent.update({
        where: { id: event.id },
        data: { status: 'CANCELLED', description: 'Sick leave' }
    });
    console.log('✅ Cancelled event:', cancelledEvent.status, cancelledEvent.description);

    // 3. Test Attendance
    console.log('\n3. Testing Attendance...');

    // Create student
    const student = await prisma.student.create({
        data: { firstName: 'John', lastName: 'Doe' }
    });

    // Add student to group
    await prisma.group.update({
        where: { id: group.id },
        data: {
            students: {
                connect: { id: student.id }
            }
        }
    });

    // Save Attendance
    await prisma.attendance.createMany({
        data: [
            { eventId: event.id, studentId: student.id, status: 'present' }
        ]
    });
    console.log('✅ Saved attendance for student:', student.id);

    // Verify Attendance
    const attendance = await prisma.attendance.findFirst({
        where: { eventId: event.id, studentId: student.id }
    });
    console.log('✅ Verified attendance status:', attendance?.status);

    // Cleanup
    console.log('\nCleaning up...');
    await prisma.attendance.deleteMany({ where: { eventId: event.id } });
    await prisma.scheduleEvent.delete({ where: { id: event.id } });
    await prisma.group.update({ where: { id: group.id }, data: { students: { disconnect: { id: student.id } } } });
    await prisma.student.delete({ where: { id: student.id } });
    await prisma.group.delete({ where: { id: group.id } });
    await prisma.user.delete({ where: { id: trainer.id } });

    console.log('✅ Cleanup complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
