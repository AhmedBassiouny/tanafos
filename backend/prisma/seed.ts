import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Create default tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        name: 'Exercise',
        unit: 'minutes',
        pointsPerUnit: 1,
        displayOrder: 1,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Reading',
        unit: 'pages',
        pointsPerUnit: 1,
        displayOrder: 2,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Water',
        unit: 'glasses',
        pointsPerUnit: 1,
        displayOrder: 3,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Meditation',
        unit: 'minutes',
        pointsPerUnit: 1,
        displayOrder: 4,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Sleep',
        unit: 'hours',
        pointsPerUnit: 1,
        displayOrder: 5,
      },
    }),
  ])

  console.log(`Created ${tasks.length} tasks`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })