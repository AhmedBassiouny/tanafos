import request from 'supertest'
import express from 'express'
import cors from 'cors'
import userRoutes from '../src/routes/user.routes'
import { errorHandler } from '../src/middleware/errorHandler'
import { createTestUser, createTestTask, generateAuthToken, createAuthHeaders, cleanDatabase, prisma } from './utils/testHelpers'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/user', userRoutes)
app.use(errorHandler)

describe('User API', () => {
  let testUser: any
  let testTask1: any, testTask2: any
  let authToken: string
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    
    testUser = await createTestUser({
      username: 'testuser',
      email: 'test@example.com'
    })
    
    testTask1 = await createTestTask({
      name: 'Exercise',
      unit: 'minutes',
      pointsPerUnit: 1
    })
    
    testTask2 = await createTestTask({
      name: 'Reading',
      unit: 'pages',
      pointsPerUnit: 2
    })
    
    authToken = generateAuthToken(testUser.id, testUser.email)
    authHeaders = createAuthHeaders(authToken)

    // Create some user scores
    await prisma.userScore.createMany({
      data: [
        // Overall score
        { userId: testUser.id, taskId: null, totalPoints: 130, totalValue: 0 },
        // Task-specific scores
        { userId: testUser.id, taskId: testTask1.id, totalPoints: 90, totalValue: 90 },
        { userId: testUser.id, taskId: testTask2.id, totalPoints: 40, totalValue: 20 },
      ]
    })
  })

  describe('GET /api/user/stats', () => {
    it('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/user/stats')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toMatchObject({
        userId: testUser.id,
        username: 'testuser',
        totalPoints: 130
      })
      
      expect(response.body.taskStats).toHaveLength(2)
      
      // Check task stats contain correct data
      const exerciseStats = response.body.taskStats.find((stat: any) => stat.taskName === 'Exercise')
      expect(exerciseStats).toMatchObject({
        taskId: testTask1.id,
        taskName: 'Exercise',
        totalValue: 90,
        totalPoints: 90
      })
      
      const readingStats = response.body.taskStats.find((stat: any) => stat.taskName === 'Reading')
      expect(readingStats).toMatchObject({
        taskId: testTask2.id,
        taskName: 'Reading',
        totalValue: 20,
        totalPoints: 40
      })
    })

    it('should return zero stats for new user', async () => {
      const newUser = await createTestUser({
        username: 'newuser',
        email: 'new@example.com'
      })
      
      const newAuthToken = generateAuthToken(newUser.id, newUser.email)
      const newAuthHeaders = createAuthHeaders(newAuthToken)

      const response = await request(app)
        .get('/api/user/stats')
        .set(newAuthHeaders)
        .expect(200)

      expect(response.body).toMatchObject({
        userId: newUser.id,
        username: 'newuser',
        totalPoints: 0,
        taskStats: []
      })
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/user/stats')
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/user/stats')
        .set({ Authorization: 'Bearer invalid_token' })
        .expect(401)

      expect(response.body.error).toBe('Invalid token')
    })
  })

  describe('GET /api/user/profile', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toMatchObject({
        id: testUser.id,
        username: 'testuser',
        email: 'test@example.com'
      })
      
      // Should not include sensitive data
      expect(response.body.passwordHash).toBeUndefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should handle deleted user', async () => {
      // Delete the user
      await prisma.user.delete({
        where: { id: testUser.id }
      })

      const response = await request(app)
        .get('/api/user/profile')
        .set(authHeaders)
        .expect(404)

      expect(response.body.error).toBe('User not found')
    })
  })
})