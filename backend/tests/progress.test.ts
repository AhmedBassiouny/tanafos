import request from 'supertest'
import express from 'express'
import cors from 'cors'
import progressRoutes from '../src/routes/progress.routes'
import { errorHandler } from '../src/middleware/errorHandler'
import { createTestUser, createTestTask, generateAuthToken, createAuthHeaders, cleanDatabase, prisma } from './utils/testHelpers'
import { Decimal } from '@prisma/client/runtime/library'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/progress', progressRoutes)
app.use(errorHandler)

describe('Progress API', () => {
  let testUser: any
  let testTask: any
  let authToken: string
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    
    testUser = await createTestUser()
    testTask = await createTestTask({
      name: 'Exercise',
      unit: 'minutes',
      pointsPerUnit: 1
    })
    authToken = generateAuthToken(testUser.id, testUser.email)
    authHeaders = createAuthHeaders(authToken)
  })

  describe('POST /api/progress', () => {
    it('should log progress successfully', async () => {
      const progressData = {
        taskId: testTask.id,
        value: 30
      }

      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(201)

      expect(response.body.message).toBe('Progress logged successfully')
      expect(response.body.progress).toMatchObject({
        taskId: testTask.id,
        value: 30,
        pointsEarned: 30 // 30 * 1 pointsPerUnit
      })
      expect(response.body.progress.task.name).toBe('Exercise')
    })

    it('should calculate points correctly', async () => {
      const task2 = await createTestTask({
        name: 'Reading',
        unit: 'pages',
        pointsPerUnit: 2
      })

      const progressData = {
        taskId: task2.id,
        value: 15
      }

      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(201)

      expect(response.body.progress.pointsEarned).toBe(30) // 15 * 2
    })

    it('should prevent duplicate progress for same day', async () => {
      const progressData = {
        taskId: testTask.id,
        value: 30
      }

      // Log progress first time
      await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(201)

      // Try to log again on same day
      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(400)

      expect(response.body.error).toBe('Progress already logged for this task today')
    })

    it('should update user scores', async () => {
      const progressData = {
        taskId: testTask.id,
        value: 25
      }

      await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(201)

      // Check task-specific score
      const taskScore = await prisma.userScore.findFirst({
        where: {
          userId: testUser.id,
          taskId: testTask.id
        }
      })

      expect(taskScore).toMatchObject({
        totalPoints: 25,
        totalValue: new Decimal(25)
      })

      // Check overall score
      const overallScore = await prisma.userScore.findFirst({
        where: {
          userId: testUser.id,
          taskId: null
        }
      })

      expect(overallScore).toMatchObject({
        totalPoints: 25
      })
    })

    it('should require authentication', async () => {
      const progressData = {
        taskId: testTask.id,
        value: 30
      }

      const response = await request(app)
        .post('/api/progress')
        .send(progressData)
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should validate task exists', async () => {
      const progressData = {
        taskId: 99999, // Non-existent task
        value: 30
      }

      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(404)

      expect(response.body.error).toBe('Task not found or inactive')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send({})
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should validate positive values', async () => {
      const progressData = {
        taskId: testTask.id,
        value: -5 // Negative value
      }

      const response = await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send(progressData)
        .expect(400)

      expect(response.body.error).toContain('greater than 0')
    })
  })

  describe('GET /api/progress/today', () => {
    it('should return empty array when no progress logged today', async () => {
      const response = await request(app)
        .get('/api/progress/today')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should return today\'s progress', async () => {
      // Log some progress
      await request(app)
        .post('/api/progress')
        .set(authHeaders)
        .send({
          taskId: testTask.id,
          value: 30
        })

      const response = await request(app)
        .get('/api/progress/today')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        taskId: testTask.id,
        taskName: 'Exercise',
        taskUnit: 'minutes',
        value: 30,
        pointsEarned: 30
      })
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/progress/today')
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })
  })
})