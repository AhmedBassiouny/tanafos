import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authenticate } from '../middleware/auth'

const router = Router()

// GET /api/tasks - Get all active tasks
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        unit: true,
        pointsPerUnit: true,
        displayOrder: true
      }
    })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

// GET /api/tasks/:id - Get single task
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.id)
    
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' })
      return
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
})

export default router