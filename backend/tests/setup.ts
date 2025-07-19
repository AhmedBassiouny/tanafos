import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanafos_test'
    }
  }
})

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect()
})

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean database before each test - use deleteMany to avoid deadlocks
  await prisma.progressLog.deleteMany()
  await prisma.userScore.deleteMany()
  await prisma.user.deleteMany()
  await prisma.task.deleteMany()
})

// Export for use in other test files
export { prisma }