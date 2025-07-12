import express from 'express'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { prisma } from './config/database'
import authRoutes from './routes/auth.routes'
import { authenticate } from './middleware/auth'


const app = express()

// Middleware
app.use(express.json())

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  next()
})

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Tanafos backend!' })
})

// Auth routes (public)
app.use('/api/auth', authRoutes)

// Protected route example
app.get('/api/me', authenticate, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })
    
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Tasks route (protected)
app.get('/api/tasks', authenticate, async (_req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    })
    res.json(tasks)
  } catch (error) {
    next(error)
  }
})


// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})