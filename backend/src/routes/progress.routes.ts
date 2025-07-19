import { Router, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'
import { ProgressService } from '../services/progress.service'
import { Validator } from '../utils/validation'
import { prisma } from '../config/database'

const router = Router()

// All progress routes require authentication
router.use(authenticate)

// POST /api/progress - Log progress
router.post('/', async (req: any, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = Validator.validateProgress(req.body)
    
    // Log progress
    const result = await ProgressService.logProgress(req.user.userId, validatedData)
    
    res.status(201).json({
      message: 'Progress logged successfully',
      progress: result
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/progress/today - Get today's progress for current user
router.get('/today', async (req: any, res: Response, next: NextFunction) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayProgress = await prisma.progressLog.findMany({
      where: {
        userId: req.user.userId,
        loggedDate: today
      },
      include: {
        task: {
          select: {
            id: true,
            name: true,
            unit: true
          }
        }
      },
      orderBy: {
        task: {
          displayOrder: 'asc'
        }
      }
    })

    const formatted = todayProgress.map(log => ({
      id: log.id,
      taskId: log.taskId,
      taskName: log.task.name,
      taskUnit: log.task.unit,
      value: log.value.toNumber(),
      pointsEarned: log.pointsEarned,
      loggedDate: log.loggedDate
    }))

    res.json(formatted)
  } catch (error) {
    next(error)
  }
})

export default router