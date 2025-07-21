import { Router, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'
import { ProgressService } from '../services/progress.service'
import { GoalService } from '../services/goal.service'
import { prisma } from '../config/database'

const router = Router()

// All user routes require authentication
router.use(authenticate)

// GET /api/user/stats - Get current user's statistics
router.get('/stats', async (req: any, res: Response, next: NextFunction) => {
  try {
    const stats = await ProgressService.getUserStats(req.user.userId)
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

// GET /api/user/profile - Get current user's profile
router.get('/profile', async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        timezone: true,
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

// PUT /api/user/timezone - Update user's timezone setting
router.put('/timezone', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { timezone } = req.body
    
    if (!timezone || typeof timezone !== 'string') {
      res.status(400).json({ 
        success: false,
        error: {
          code: 'INVALID_TIMEZONE',
          message: 'Timezone is required and must be a string.'
        }
      })
      return
    }

    const result = await GoalService.updateUserTimezone(req.user.userId, timezone)
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

export default router