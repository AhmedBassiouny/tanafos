import request from 'supertest'
import express from 'express'
import cors from 'cors'
import leaderboardRoutes from '../src/routes/leaderboard.routes'
import { errorHandler } from '../src/middleware/errorHandler'
import { LeaderboardService } from '../src/services/leaderboard.service'
import { createTestUser, createTestTask, generateAuthToken, createAuthHeaders, cleanDatabase, prisma } from './utils/testHelpers'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/leaderboard', leaderboardRoutes)
app.use(errorHandler)

describe('Leaderboard API', () => {
  let user1: any, user2: any, user3: any
  let testTask: any
  let authToken: string
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    
    // Create test users
    user1 = await createTestUser({ username: 'user1', email: 'user1@test.com' })
    user2 = await createTestUser({ username: 'user2', email: 'user2@test.com' })
    user3 = await createTestUser({ username: 'user3', email: 'user3@test.com' })
    
    testTask = await createTestTask({
      name: 'Exercise',
      unit: 'minutes',
      pointsPerUnit: 1
    })
    
    authToken = generateAuthToken(user1.id, user1.email)
    authHeaders = createAuthHeaders(authToken)

    // Create some user scores for testing
    await prisma.userScore.createMany({
      data: [
        // Overall scores
        { userId: user1.id, taskId: null, totalPoints: 100, totalValue: 0 },
        { userId: user2.id, taskId: null, totalPoints: 200, totalValue: 0 },
        { userId: user3.id, taskId: null, totalPoints: 150, totalValue: 0 },
        // Task-specific scores
        { userId: user1.id, taskId: testTask.id, totalPoints: 50, totalValue: 50 },
        { userId: user2.id, taskId: testTask.id, totalPoints: 75, totalValue: 75 },
        { userId: user3.id, taskId: testTask.id, totalPoints: 60, totalValue: 60 },
      ]
    })
  })

  describe('GET /api/leaderboard', () => {
    it('should return overall leaderboard ordered by points', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toHaveLength(3)
      
      // Should be ordered by totalPoints descending
      expect(response.body[0]).toMatchObject({
        rank: 1,
        userId: user2.id,
        totalPoints: 200
      })
      expect(response.body[1]).toMatchObject({
        rank: 2,
        userId: user3.id,
        totalPoints: 150
      })
      expect(response.body[2]).toMatchObject({
        rank: 3,
        userId: user1.id,
        totalPoints: 100
      })
    })

    it('should include usernames in leaderboard', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .set(authHeaders)
        .expect(200)

      expect(response.body[0].username).toBeDefined()
      expect(typeof response.body[0].username).toBe('string')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/leaderboard')
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should handle empty leaderboard', async () => {
      // Clean all scores and cache
      await prisma.userScore.deleteMany()
      LeaderboardService.clearAllCache()

      const response = await request(app)
        .get('/api/leaderboard')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toEqual([])
    })
  })

  describe('GET /api/leaderboard/:taskId', () => {
    it('should return task-specific leaderboard', async () => {
      const response = await request(app)
        .get(`/api/leaderboard/${testTask.id}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body).toHaveLength(3)
      
      // Should be ordered by totalPoints descending
      expect(response.body[0]).toMatchObject({
        rank: 1,
        userId: user2.id,
        totalPoints: 75,
        totalValue: 75
      })
      expect(response.body[1]).toMatchObject({
        rank: 2,
        userId: user3.id,
        totalPoints: 60,
        totalValue: 60
      })
      expect(response.body[2]).toMatchObject({
        rank: 3,
        userId: user1.id,
        totalPoints: 50,
        totalValue: 50
      })
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/leaderboard/99999')
        .set(authHeaders)
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/leaderboard/${testTask.id}`)
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should handle invalid task id', async () => {
      const response = await request(app)
        .get('/api/leaderboard/invalid')
        .set(authHeaders)
        .expect(400)

      expect(response.body.error).toBe('Invalid task ID')
    })

    it('should handle empty task leaderboard', async () => {
      // Create task with no scores
      const emptyTask = await createTestTask({ name: 'Empty Task' })

      const response = await request(app)
        .get(`/api/leaderboard/${emptyTask.id}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body).toEqual([])
    })
  })
})