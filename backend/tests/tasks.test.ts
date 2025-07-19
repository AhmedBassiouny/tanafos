import request from 'supertest'
import express from 'express'
import cors from 'cors'
import taskRoutes from '../src/routes/task.routes'
import { authenticate } from '../src/middleware/auth'
import { errorHandler } from '../src/middleware/errorHandler'
import { createTestUser, createTestTask, generateAuthToken, createAuthHeaders, cleanDatabase } from './utils/testHelpers'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/tasks', taskRoutes)
app.use(errorHandler)

describe('Tasks API', () => {
  let testUser: any
  let authToken: string
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    
    testUser = await createTestUser()
    authToken = generateAuthToken(testUser.id, testUser.email)
    authHeaders = createAuthHeaders(authToken)
  })

  describe('GET /api/tasks', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })

    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toEqual([])
    })

    it('should return tasks ordered by displayOrder', async () => {
      // Create test tasks
      const task1 = await createTestTask({
        name: 'Task B',
        displayOrder: 2
      })
      const task2 = await createTestTask({
        name: 'Task A',
        displayOrder: 1
      })
      const task3 = await createTestTask({
        name: 'Task C',
        displayOrder: 3
      })

      const response = await request(app)
        .get('/api/tasks')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toHaveLength(3)
      expect(response.body[0].name).toBe('Task A')
      expect(response.body[1].name).toBe('Task B')
      expect(response.body[2].name).toBe('Task C')
    })

    it('should only return active tasks', async () => {
      const activeTask = await createTestTask({
        name: 'Active Task',
        isActive: true
      })
      
      const inactiveTask = await createTestTask({
        name: 'Inactive Task',
        isActive: false
      })

      const response = await request(app)
        .get('/api/tasks')
        .set(authHeaders)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].name).toBe('Active Task')
    })
  })

  describe('GET /api/tasks/:id', () => {
    it('should return specific task by id', async () => {
      const task = await createTestTask({
        name: 'Specific Task',
        unit: 'minutes',
        pointsPerUnit: 2
      })

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set(authHeaders)
        .expect(200)

      expect(response.body).toMatchObject({
        id: task.id,
        name: 'Specific Task',
        unit: 'minutes',
        pointsPerUnit: 2
      })
    })

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/99999')
        .set(authHeaders)
        .expect(404)

      expect(response.body.error).toBe('Task not found')
    })

    it('should require authentication', async () => {
      const task = await createTestTask()

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .expect(401)

      expect(response.body.error).toBe('Authentication token is required')
    })
  })
})