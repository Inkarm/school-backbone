import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching first group and first student...');
        const group = await prisma.group.findFirst();
        const student = await prisma.student.findFirst();

        if (!group || !student) {
            console.log('No group or student found to test.');
            return;
        }

        console.log(`Found Group: ${group.name} (${group.id})`);
        console.log(`Found Student: ${student.firstName} ${student.lastName} (${student.id})`);

        console.log('Attempting to connect student to group...');
        const updatedGroup = await prisma.group.update({
            where: { id: group.id },
            data: {
                students: {
                    connect: { id: student.id }
                }
            },
            include: { students: true }
        });

        console.log('Successfully connected!');
        console.log('Group students:', updatedGroup.students.map(s => s.id));

        console.log('Attempting to disconnect student from group...');
        const disconnectedGroup = await prisma.group.update({
            where: { id: group.id },
            data: {
                students: {
                    disconnect: { id: student.id }
                }
            },
            include: { students: true }
        });
        console.log('Successfully disconnected!');
        console.log('Group students:', disconnectedGroup.students.map(s => s.id));

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
