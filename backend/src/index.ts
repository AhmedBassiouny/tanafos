import express from 'express'
import { config } from './config'
import { errorHandler } from './middleware/errorHandler'
import { prisma } from './config/database'
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import progressRoutes from './routes/progress.routes'
import leaderboardRoutes from './routes/leaderboard.routes'
import userRoutes from './routes/user.routes'


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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/user', userRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})


// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log('Available routes:')
  console.log('  - POST   /api/auth/signup')
  console.log('  - POST   /api/auth/login')
  console.log('  - GET    /api/tasks')
  console.log('  - POST   /api/progress')
  console.log('  - GET    /api/leaderboard')
  console.log('  - GET    /api/user/stats')
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close()
  await prisma.$disconnect()
  process.exit(0)
})