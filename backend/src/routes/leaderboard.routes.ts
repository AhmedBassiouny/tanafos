import { Router, Request, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'
import { LeaderboardService } from '../services/leaderboard.service'

const router = Router()

// All leaderboard routes require authentication
router.use(authenticate)

// GET /api/leaderboard - Overall leaderboard
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaderboard = await LeaderboardService.getOverallLeaderboard()
    res.json(leaderboard)
  } catch (error) {
    next(error)
  }
})

// GET /api/leaderboard/:taskId - Task-specific leaderboard
router.get('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = parseInt(req.params.taskId)
    
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' })
      return
    }

    const leaderboard = await LeaderboardService.getTaskLeaderboard(taskId)
    res.json(leaderboard)
  } catch (error) {
    next(error)
  }
})

export default router