const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { login: 'admin' },
        update: {},
        create: {
            login: 'admin',
            password: 'password123', // In real app, hash this!
            role: 'admin',
        },
    })

    const trainer = await prisma.user.upsert({
        where: { login: 'anna' },
        update: {},
        create: {
            login: 'anna',
            password: 'password123',
            role: 'trainer',
        },
    })

    console.log({ admin, trainer })

    // 2. Create Group
    const group = await prisma.group.create({
        data: {
            name: 'Balet Początkujący',
            defaultTrainerId: trainer.id,
            ratePerClass: 50.0,
        },
    })

    console.log({ group })

    // 3. Create Student
    const student = await prisma.student.create({
        data: {
            name: 'Jan Kowalski Jr.',
            parentPhone: '500-600-700',
            notes: 'Alergia na orzeszki',
            groups: {
                connect: { id: group.id },
            },
        },
    })

    console.log({ student })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
