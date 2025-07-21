import request from 'supertest'
import express from 'express'
import cors from 'cors'
import goalRoutes from '../../src/routes/goal.routes'
import { errorHandler } from '../../src/middleware/errorHandler'
import { createTestUser, createTestTask, generateAuthToken, createAuthHeaders, cleanDatabase, prisma } from '../utils/testHelpers'
import { Decimal } from '@prisma/client/runtime/library'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/goals', goalRoutes)
app.use(errorHandler)

describe('Goals API', () => {
  let testUser: any
  let testTask1: any
  let testTask2: any
  let authToken: string
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    
    testUser = await createTestUser()
    testTask1 = await createTestTask({
      name: 'Prayer on Time',
      unit: 'prayers',
      pointsPerUnit: 5
    })
    testTask2 = await createTestTask({
      name: 'Quran Reading',
      unit: 'pages',
      pointsPerUnit: 3
    })

    // Create daily goals
    await prisma.dailyGoal.createMany({
      data: [
        {
          taskId: testTask1.id,
          targetValue: new Decimal(5),
          targetType: 'EXACT'
        },
        {
          taskId: testTask2.id,
          targetValue: new Decimal(2),
          targetType: 'MINIMUM'
        }
      ]
    })

    authToken = generateAuthToken(testUser.id, testUser.email)
    authHeaders = createAuthHeaders(authToken)
  })

  describe('GET /api/goals/daily', () => {
    it('should return daily goals with progress for authenticated user', async () => {
      const response = await request(app)
        .get('/api/goals/daily')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('goalDate')
      expect(response.body.data).toHaveProperty('userTimezone')
      expect(response.body.data).toHaveProperty('localTime')
      expect(response.body.data).toHaveProperty('overallProgress')
      expect(response.body.data).toHaveProperty('goals')

      const { overallProgress, goals } = response.body.data
      expect(overallProgress).toHaveProperty('completed')
      expect(overallProgress).toHaveProperty('total')
      expect(overallProgress).toHaveProperty('completionRate')
      expect(goals).toBeInstanceOf(Array)
      expect(goals).toHaveLength(2)

      // Verify goal structure
      const goal = goals[0]
      expect(goal).toHaveProperty('id')
      expect(goal).toHaveProperty('userId')
      expect(goal).toHaveProperty('taskId')
      expect(goal).toHaveProperty('taskName')
      expect(goal).toHaveProperty('unit')
      expect(goal).toHaveProperty('currentValue')
      expect(goal).toHaveProperty('targetValue')
      expect(goal).toHaveProperty('status')
      expect(goal).toHaveProperty('completionRate')
    })

    it('should handle specific date parameter', async () => {
      const testDate = '2025-07-15'
      
      const response = await request(app)
        .get(`/api/goals/daily?date=${testDate}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body.data.goalDate).toBe(testDate)
    })

    it('should handle timezone parameter', async () => {
      const response = await request(app)
        .get('/api/goals/daily?timezone=Asia/Dubai')
        .set(authHeaders)
        .expect(200)

      expect(response.body.data.userTimezone).toBe('Asia/Dubai')
    })

    it('should return 400 for invalid date format', async () => {
      await request(app)
        .get('/api/goals/daily?date=invalid-date')
        .set(authHeaders)
        .expect(400)
    })

    it('should return 400 for invalid timezone', async () => {
      const response = await request(app)
        .get('/api/goals/daily?timezone=Invalid/Timezone')
        .set(authHeaders)
        .expect(400)

      expect(response.body.error).toBe('Invalid timezone format. Must be a valid IANA timezone identifier.')
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/goals/daily')
        .expect(401)
    })
  })

  describe('GET /api/goals/history', () => {
    beforeEach(async () => {
      // Create some historical data
      const historyData = [
        {
          userId: testUser.id,
          taskId: testTask1.id,
          goalDate: new Date('2025-07-15'),
          targetValue: new Decimal(5),
          finalValue: new Decimal(5),
          completionRate: new Decimal(100),
          status: 'COMPLETED' as const,
          completedAt: new Date('2025-07-15T17:30:00Z')
        },
        {
          userId: testUser.id,
          taskId: testTask1.id,
          goalDate: new Date('2025-07-16'),
          targetValue: new Decimal(5),
          finalValue: new Decimal(3),
          completionRate: new Decimal(60),
          status: 'IN_PROGRESS' as const,
          completedAt: null
        }
      ]

      await prisma.dailyGoalHistory.createMany({ data: historyData })
    })

    it('should return goal history with summary', async () => {
      const response = await request(app)
        .get('/api/goals/history')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('history')
      expect(response.body.data).toHaveProperty('pagination')
      expect(response.body.data).toHaveProperty('summary')

      const { history, summary, pagination } = response.body.data
      expect(history).toBeInstanceOf(Array)
      expect(summary).toHaveProperty('totalDays')
      expect(summary).toHaveProperty('completedDays')
      expect(summary).toHaveProperty('averageCompletionRate')
      expect(summary).toHaveProperty('streak')
      expect(pagination).toHaveProperty('limit')
      expect(pagination).toHaveProperty('offset')
      expect(pagination).toHaveProperty('total')
    })

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/goals/history?startDate=2025-07-15&endDate=2025-07-15')
        .set(authHeaders)
        .expect(200)

      const { history } = response.body.data
      expect(history).toHaveLength(1)
      expect(history[0].goalDate).toBe('2025-07-15')
    })

    it('should filter by task ID', async () => {
      const response = await request(app)
        .get(`/api/goals/history?taskId=${testTask1.id}`)
        .set(authHeaders)
        .expect(200)

      const { history } = response.body.data
      history.forEach((h: any) => {
        expect(h.taskId).toBe(testTask1.id)
      })
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/goals/history?limit=1&offset=1')
        .set(authHeaders)
        .expect(200)

      const { pagination } = response.body.data
      expect(pagination.limit).toBe(1)
      expect(pagination.offset).toBe(1)
    })

    it('should validate date format', async () => {
      await request(app)
        .get('/api/goals/history?startDate=invalid-date')
        .set(authHeaders)
        .expect(400)
    })

    it('should validate task ID format', async () => {
      await request(app)
        .get('/api/goals/history?taskId=not-a-number')
        .set(authHeaders)
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/goals/history')
        .expect(401)
    })
  })

  describe('GET /api/goals/analytics', () => {
    it('should return analytics data with default period', async () => {
      const response = await request(app)
        .get('/api/goals/analytics')
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('period')
      expect(response.body.data).toHaveProperty('globalStats')
      expect(response.body.data).toHaveProperty('taskBreakdown')
      expect(response.body.data).toHaveProperty('trends')

      const { globalStats, taskBreakdown } = response.body.data
      expect(globalStats).toHaveProperty('totalActiveUsers')
      expect(globalStats).toHaveProperty('averageGoalsCompleted')
      expect(globalStats).toHaveProperty('topPerformingTask')
      expect(taskBreakdown).toBeInstanceOf(Array)
    })

    it('should handle different period parameters', async () => {
      const periods = ['1d', '7d', '30d', '90d']
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/goals/analytics?period=${period}`)
          .set(authHeaders)
          .expect(200)

        expect(response.body.data.period).toBe(period)
      }
    })

    it('should return 400 for invalid period', async () => {
      await request(app)
        .get('/api/goals/analytics?period=invalid')
        .set(authHeaders)
        .expect(400)
    })

    it('should handle task ID filter', async () => {
      const response = await request(app)
        .get(`/api/goals/analytics?taskId=${testTask1.id}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should validate task ID format', async () => {
      await request(app)
        .get('/api/goals/analytics?taskId=not-a-number')
        .set(authHeaders)
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .get('/api/goals/analytics')
        .expect(401)
    })
  })

  describe('PUT /api/goals/timezone', () => {
    it('should update user timezone successfully', async () => {
      const newTimezone = 'Asia/Dubai'
      
      const response = await request(app)
        .put('/api/goals/timezone')
        .set(authHeaders)
        .send({ timezone: newTimezone })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.userId).toBe(testUser.id)
      expect(response.body.data.timezone).toBe(newTimezone)
      expect(response.body.data).toHaveProperty('updatedAt')
      expect(response.body.data).toHaveProperty('goalResetTime')
      expect(response.body.data).toHaveProperty('nextGoalReset')

      // Verify database was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })
      expect(updatedUser!.timezone).toBe(newTimezone)
    })

    it('should return 400 for missing timezone', async () => {
      await request(app)
        .put('/api/goals/timezone')
        .set(authHeaders)
        .send({})
        .expect(400)
    })

    it('should return 400 for invalid timezone type', async () => {
      await request(app)
        .put('/api/goals/timezone')
        .set(authHeaders)
        .send({ timezone: 123 })
        .expect(400)
    })

    it('should return 400 for invalid timezone format', async () => {
      await request(app)
        .put('/api/goals/timezone')
        .set(authHeaders)
        .send({ timezone: 'Invalid/Timezone' })
        .expect(400)
    })

    it('should require authentication', async () => {
      await request(app)
        .put('/api/goals/timezone')
        .send({ timezone: 'UTC' })
        .expect(401)
    })
  })

  describe('Integration with Progress Logging', () => {
    it('should update goal progress when logging activity', async () => {
      // First, get initial goal state
      const initialResponse = await request(app)
        .get('/api/goals/daily')
        .set(authHeaders)
        .expect(200)

      const initialGoal = initialResponse.body.data.goals.find((g: any) => g.taskId === testTask1.id)
      expect(initialGoal.status).toBe('NOT_STARTED')
      expect(initialGoal.currentValue).toBe(0)

      // Log some progress (need to use progress service simulation)
      // Create a progress log directly for testing
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      await prisma.progressLog.create({
        data: {
          userId: testUser.id,
          taskId: testTask1.id,
          value: new Decimal(3),
          pointsEarned: 15,
          loggedDate: today
        }
      })

      // Check updated goal state
      const updatedResponse = await request(app)
        .get('/api/goals/daily')
        .set(authHeaders)
        .expect(200)

      const updatedGoal = updatedResponse.body.data.goals.find((g: any) => g.taskId === testTask1.id)
      expect(updatedGoal.status).toBe('IN_PROGRESS')
      expect(updatedGoal.currentValue).toBe(3)
      expect(updatedGoal.completionRate).toBe(60)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simulate database error by using non-existent user ID in auth token
      const invalidToken = generateAuthToken(99999, 'invalid@example.com')
      const invalidHeaders = createAuthHeaders(invalidToken)

      const response = await request(app)
        .get('/api/goals/daily')
        .set(invalidHeaders)
        .expect(404)

      expect(response.body.error).toBe('User not found')
    })

    it('should handle service errors with proper error codes', async () => {
      const response = await request(app)
        .get('/api/goals/daily?timezone=Invalid/Timezone')
        .set(authHeaders)
        .expect(400)

      expect(response.body.error).toBe('Invalid timezone format. Must be a valid IANA timezone identifier.')
    })
  })
})