import { Router, Response, NextFunction } from 'express'
import { authenticate } from '../middleware/auth'
import { GoalService } from '../services/goal.service'
import { Validator } from '../utils/validation'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// All goal routes require authentication
router.use(authenticate)

// GET /api/goals/daily - Get current daily goals with progress for authenticated user
router.get('/daily', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { date, timezone } = req.query
    
    // Validate optional parameters
    let parsedDate: Date | undefined
    if (date) {
      parsedDate = new Date(date as string)
      if (isNaN(parsedDate.getTime())) {
        throw new AppError('Invalid date format. Use YYYY-MM-DD format.', 400)
      }
    }

    if (timezone && !GoalService.isValidTimezone(timezone as string)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIMEZONE',
          message: 'Invalid timezone format. Must be a valid IANA timezone identifier.',
          details: `Received: '${timezone}', Expected format: 'Asia/Dubai'`
        }
      })
    }

    const result = await GoalService.getDailyGoalsForUser(
      req.user.userId,
      parsedDate,
      timezone as string
    )

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.statusCode === 404 ? 'USER_NOT_FOUND' : 'CALCULATION_ERROR',
          message: error.message
        }
      })
    }
    next(error)
  }
})

// GET /api/goals/history - Get historical goal achievement data
router.get('/history', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, taskId, limit = '30', offset = '0' } = req.query
    
    // Validate parameters
    let parsedStartDate: Date | undefined
    let parsedEndDate: Date | undefined
    let parsedTaskId: number | undefined
    let parsedLimit = parseInt(limit as string)
    let parsedOffset = parseInt(offset as string)

    if (startDate) {
      parsedStartDate = new Date(startDate as string)
      if (isNaN(parsedStartDate.getTime())) {
        throw new AppError('Invalid start date format. Use YYYY-MM-DD format.', 400)
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate as string)
      if (isNaN(parsedEndDate.getTime())) {
        throw new AppError('Invalid end date format. Use YYYY-MM-DD format.', 400)
      }
    }

    if (taskId) {
      parsedTaskId = parseInt(taskId as string)
      if (isNaN(parsedTaskId)) {
        throw new AppError('Invalid task ID. Must be a number.', 400)
      }
    }

    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      parsedLimit = 30
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      parsedOffset = 0
    }

    const result = await GoalService.getGoalHistory(
      req.user.userId,
      parsedStartDate,
      parsedEndDate,
      parsedTaskId,
      parsedLimit,
      parsedOffset
    )

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/goals/analytics - Get goal completion analytics for community insights
router.get('/analytics', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { period = '7d', taskId } = req.query
    
    // Validate period parameter
    const validPeriods = ['1d', '7d', '30d', '90d']
    if (!validPeriods.includes(period as string)) {
      throw new AppError('Invalid period. Must be one of: 1d, 7d, 30d, 90d', 400)
    }

    let parsedTaskId: number | undefined
    if (taskId) {
      parsedTaskId = parseInt(taskId as string)
      if (isNaN(parsedTaskId)) {
        throw new AppError('Invalid task ID. Must be a number.', 400)
      }
    }

    // Calculate date range based on period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
    }

    // For now, return mock analytics data as the design document indicates
    // this will be implemented in Phase 3
    const mockAnalytics = {
      period: period as string,
      globalStats: {
        totalActiveUsers: 1250,
        averageGoalsCompleted: 3.2,
        topPerformingTask: {
          taskId: 2,
          taskName: "Prayer on Time",
          completionRate: 89.5
        }
      },
      taskBreakdown: [
        {
          taskId: 2,
          taskName: "Prayer on Time",
          targetValue: 5.0,
          averageCompletion: 4.7,
          completionRate: 89.5,
          totalCompletions: 1119
        },
        {
          taskId: 1,
          taskName: "Quran Reading",
          targetValue: 2.0,
          averageCompletion: 1.8,
          completionRate: 78.2,
          totalCompletions: 978
        }
      ],
      trends: {
        dailyCompletionRates: [85.2, 87.1, 89.5, 91.2, 88.8, 90.1, 89.5]
      }
    }

    res.json({
      success: true,
      data: mockAnalytics
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/goals/timezone - Update user's timezone setting
router.put('/timezone', async (req: any, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { timezone } = req.body
    
    if (!timezone || typeof timezone !== 'string') {
      throw new AppError('Timezone is required and must be a string.', 400)
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