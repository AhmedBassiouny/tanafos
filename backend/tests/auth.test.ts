import request from 'supertest'
import express from 'express'
import cors from 'cors'
import authRoutes from '../src/routes/auth.routes'
import { errorHandler } from '../src/middleware/errorHandler'
import { createTestUser, cleanDatabase } from './utils/testHelpers'

// Create test app
const app = express()
app.use(express.json())
app.use(cors())
app.use('/api/auth', authRoutes)
app.use(errorHandler)

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201)

      expect(response.body.message).toBe('User created successfully')
      expect(response.body.user).toMatchObject({
        username: userData.username,
        email: userData.email
      })
      expect(response.body.user.id).toBeDefined()
      expect(response.body.token).toBeDefined()
      expect(response.body.user.passwordHash).toBeUndefined() // Should not expose password
    })

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123'
      }

      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201)

      // Try to create second user with same email
      const duplicateData = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password456'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(duplicateData)
        .expect(400)

      expect(response.body.error).toContain('Email already registered')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({})
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400)

      expect(response.body.error).toContain('valid email')
    })

    it('should validate password length', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Too short
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400)

      expect(response.body.error).toContain('Password must be at least 6 characters long')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await createTestUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.message).toBe('Login successful')
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com'
      })
      expect(response.body.token).toBeDefined()
      expect(response.body.user.passwordHash).toBeUndefined()
    })

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe('Invalid email or password')
    })

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.error).toBe('Invalid email or password')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(response.body.error).toBeDefined()
    })
  })
})