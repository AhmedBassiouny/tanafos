import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
  try {
    await prisma.progressLog.deleteMany()
    await prisma.userScore.deleteMany()
    await prisma.user.deleteMany()
    await prisma.task.deleteMany()
  } catch (error) {
    console.warn('Warning: Could not clean all tables. Some may not exist yet:', error)
    // Try to clean tables that do exist
    try {
      await prisma.user.deleteMany()
    } catch {}
    try {
      await prisma.task.deleteMany()
    } catch {}
  }
})

// Export for use in other test files
export { prisma }