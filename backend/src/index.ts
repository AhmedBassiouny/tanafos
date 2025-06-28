import express from 'express'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { prisma } from './config/database'


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

// Test database connection
app.get('/api/tasks', async (req, res, next) => {
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