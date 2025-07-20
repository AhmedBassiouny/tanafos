import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../src/config'
import { prisma } from '../setup'
import { LeaderboardService } from '../../src/services/leaderboard.service'

export const createTestUser = async (userData?: Partial<{
  username: string
  email: string
  password: string
}>) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const defaultData = {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'password123'
  }
  
  const data = { ...defaultData, ...userData }
  
  const passwordHash = await bcrypt.hash(data.password, 10)
  
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash
    }
  })
}

export const createTestTask = async (taskData?: Partial<{
  name: string
  unit: string
  pointsPerUnit: number
  displayOrder: number
  isActive: boolean
}>) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const defaultData = {
    name: `Test Task ${timestamp}_${random}`,
    unit: 'units',
    pointsPerUnit: 1,
    displayOrder: 1,
    isActive: true
  }
  
  const data = { ...defaultData, ...taskData }
  
  return prisma.task.create({ data })
}

export const generateAuthToken = (userId: number, email: string) => {
  return jwt.sign(
    { userId, email },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`
})

export const cleanDatabase = async () => {
  // Delete in order to respect foreign key constraints
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
  
  // Clear cache to ensure fresh data
  LeaderboardService.clearAllCache()
}

export { prisma }