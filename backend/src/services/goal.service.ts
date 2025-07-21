import { prisma } from '../config/database'
import { AppError } from '../middleware/errorHandler'
import { Decimal } from '@prisma/client/runtime/library'
import { GoalStatus, GoalType } from '@prisma/client'

export interface DailyGoalWithProgress {
  id: number
  userId: number
  taskId: number
  taskName: string
  unit: string
  goalDate: string
  currentValue: number
  targetValue: number
  targetType: GoalType
  status: GoalStatus
  completionRate: number
  completedAt?: Date
  lastUpdated: Date
}

export interface DailyGoalsSummary {
  goalDate: string
  userTimezone: string
  localTime: string
  overallProgress: {
    completed: number
    total: number
    completionRate: number
  }
  goals: DailyGoalWithProgress[]
}

export interface GoalCompletionResult {
  goalCompleted: boolean
  targetReached: boolean
  previousStatus: GoalStatus
  newStatus: GoalStatus
  completionRate: number
}

export class GoalService {
  /**
   * Get user's local date based on their timezone
   */
  static getUserLocalDate(timezone: string): Date {
    try {
      const now = new Date()
      // Convert to user's timezone and get just the date part
      const userDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
      userDate.setHours(0, 0, 0, 0)
      return userDate
    } catch (error) {
      // Fallback to UTC if invalid timezone
      const utcDate = new Date()
      utcDate.setHours(0, 0, 0, 0)
      return utcDate
    }
  }

  /**
   * Validate timezone format
   */
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
      return true
    } catch {
      return false
    }
  }

  /**
   * Calculate daily goal progress for a user on a specific date
   */
  static async calculateDailyProgress(
    userId: number,
    date?: Date,
    timezone?: string
  ): Promise<DailyGoalWithProgress[]> {
    // Get user's timezone if not provided
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const userTimezone = timezone || user.timezone
    const goalDate = date || this.getUserLocalDate(userTimezone)
    const goalDateString = goalDate.toISOString().split('T')[0]

    // Get all active daily goals with their tasks
    const dailyGoals = await prisma.dailyGoal.findMany({
      where: { isActive: true },
      include: {
        task: {
          select: {
            id: true,
            name: true,
            unit: true
          }
        }
      }
    })

    if (dailyGoals.length === 0) {
      return []
    }

    // Get or create daily goal progress entries for this user and date
    const results: DailyGoalWithProgress[] = []

    for (const dailyGoal of dailyGoals) {
      // Check if progress entry exists
      let goalProgress = await prisma.dailyGoalProgress.findUnique({
        where: {
          userId_taskId_goalDate: {
            userId,
            taskId: dailyGoal.taskId,
            goalDate
          }
        }
      })

      // If no progress entry exists, create one
      if (!goalProgress) {
        goalProgress = await prisma.dailyGoalProgress.create({
          data: {
            userId,
            taskId: dailyGoal.taskId,
            goalDate,
            targetValue: dailyGoal.targetValue,
            currentValue: new Decimal(0),
            status: 'NOT_STARTED'
          }
        })
      }

      // Get current day's progress from progress logs
      const progressSum = await prisma.progressLog.aggregate({
        where: {
          userId,
          taskId: dailyGoal.taskId,
          loggedDate: goalDate
        },
        _sum: {
          value: true
        }
      })

      const currentValue = progressSum._sum.value?.toNumber() || 0
      const targetValue = dailyGoal.targetValue.toNumber()
      
      // Calculate completion rate and status
      const { completionRate, status, completedAt } = this.calculateGoalStatus(
        currentValue,
        targetValue,
        dailyGoal.targetType,
        goalProgress.completedAt
      )

      // Update progress if values have changed
      if (
        goalProgress.currentValue.toNumber() !== currentValue ||
        goalProgress.status !== status
      ) {
        goalProgress = await prisma.dailyGoalProgress.update({
          where: { id: goalProgress.id },
          data: {
            currentValue: new Decimal(currentValue),
            status,
            completedAt
          }
        })
      }

      results.push({
        id: goalProgress.id,
        userId,
        taskId: dailyGoal.taskId,
        taskName: dailyGoal.task.name,
        unit: dailyGoal.task.unit,
        goalDate: goalDateString,
        currentValue,
        targetValue,
        targetType: dailyGoal.targetType,
        status,
        completionRate,
        completedAt,
        lastUpdated: goalProgress.lastUpdated
      })
    }

    return results
  }

  /**
   * Calculate goal status based on current and target values
   */
  static calculateGoalStatus(
    currentValue: number,
    targetValue: number,
    targetType: GoalType,
    existingCompletedAt?: Date | null
  ): { completionRate: number; status: GoalStatus; completedAt?: Date } {
    let completionRate = 0
    let status: GoalStatus = 'NOT_STARTED'
    let completedAt = existingCompletedAt

    if (currentValue === 0) {
      completionRate = 0
      status = 'NOT_STARTED'
    } else {
      switch (targetType) {
        case 'EXACT':
          completionRate = Math.round((currentValue / targetValue) * 100)
          if (currentValue === targetValue) {
            status = 'COMPLETED'
            if (!completedAt) completedAt = new Date()
          } else if (currentValue > targetValue) {
            status = 'EXCEEDED'
            if (!completedAt) completedAt = new Date()
          } else {
            status = 'IN_PROGRESS'
          }
          break

        case 'MINIMUM':
          completionRate = Math.round((currentValue / targetValue) * 100)
          if (currentValue >= targetValue) {
            status = currentValue > targetValue ? 'EXCEEDED' : 'COMPLETED'
            if (!completedAt) completedAt = new Date()
          } else {
            status = 'IN_PROGRESS'
          }
          break

        case 'MAXIMUM':
          // For maximum goals, completion rate is inverted
          if (currentValue <= targetValue) {
            completionRate = 100
            status = 'COMPLETED'
            if (!completedAt) completedAt = new Date()
          } else {
            completionRate = Math.max(0, Math.round(100 - ((currentValue - targetValue) / targetValue) * 100))
            status = 'EXCEEDED' // Exceeded means went over the limit
          }
          break
      }
    }

    return { completionRate, status, completedAt: completedAt || undefined }
  }

  /**
   * Check if a goal was just completed (for triggering celebrations)
   */
  static async checkGoalCompletion(
    userId: number,
    taskId: number,
    date?: Date,
    timezone?: string
  ): Promise<GoalCompletionResult | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const userTimezone = timezone || user.timezone
    const goalDate = date || this.getUserLocalDate(userTimezone)

    // Get the goal progress entry
    const goalProgress = await prisma.dailyGoalProgress.findUnique({
      where: {
        userId_taskId_goalDate: {
          userId,
          taskId,
          goalDate
        }
      },
      include: {
        task: {
          include: {
            dailyGoal: true
          }
        }
      }
    })

    if (!goalProgress || !goalProgress.task.dailyGoal) {
      return null
    }

    const previousStatus = goalProgress.status
    
    // Recalculate current progress
    const progressSum = await prisma.progressLog.aggregate({
      where: {
        userId,
        taskId,
        loggedDate: goalDate
      },
      _sum: {
        value: true
      }
    })

    const currentValue = progressSum._sum.value?.toNumber() || 0
    const targetValue = goalProgress.task.dailyGoal.targetValue.toNumber()
    
    const { completionRate, status, completedAt } = this.calculateGoalStatus(
      currentValue,
      targetValue,
      goalProgress.task.dailyGoal.targetType,
      goalProgress.completedAt
    )

    // Update the progress if status changed
    if (status !== previousStatus) {
      await prisma.dailyGoalProgress.update({
        where: { id: goalProgress.id },
        data: {
          currentValue: new Decimal(currentValue),
          status,
          completedAt
        }
      })
    }

    const goalCompleted = (previousStatus !== 'COMPLETED' && previousStatus !== 'EXCEEDED') && 
                         (status === 'COMPLETED' || status === 'EXCEEDED')
    
    const targetReached = status === 'COMPLETED' || status === 'EXCEEDED'

    return {
      goalCompleted,
      targetReached,
      previousStatus,
      newStatus: status,
      completionRate
    }
  }

  /**
   * Get daily goals with progress for a user
   */
  static async getDailyGoalsForUser(
    userId: number,
    date?: Date,
    timezone?: string
  ): Promise<DailyGoalsSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const userTimezone = timezone || user.timezone
    
    // Validate timezone if provided
    if (timezone && !this.isValidTimezone(timezone)) {
      throw new AppError('Invalid timezone format. Must be a valid IANA timezone identifier.', 400)
    }

    const goalDate = date || this.getUserLocalDate(userTimezone)
    const goalDateString = goalDate.toISOString().split('T')[0]
    
    // Get local time in user's timezone
    const localTime = new Date().toLocaleString('sv-SE', { 
      timeZone: userTimezone,
      timeZoneName: 'short'
    })

    // Calculate daily progress
    const goals = await this.calculateDailyProgress(userId, goalDate, userTimezone)
    
    // Calculate overall progress
    const completed = goals.filter(g => g.status === 'COMPLETED' || g.status === 'EXCEEDED').length
    const total = goals.length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      goalDate: goalDateString,
      userTimezone,
      localTime,
      overallProgress: {
        completed,
        total,
        completionRate
      },
      goals
    }
  }

  /**
   * Update user's timezone
   */
  static async updateUserTimezone(userId: number, timezone: string) {
    if (!this.isValidTimezone(timezone)) {
      throw new AppError('Invalid timezone format. Must be a valid IANA timezone identifier.', 400)
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { timezone }
    })

    // Calculate next goal reset time in the new timezone
    const nextReset = new Date()
    nextReset.setDate(nextReset.getDate() + 1)
    const nextResetLocal = new Date(nextReset.toLocaleString('en-US', { timeZone: timezone }))
    nextResetLocal.setHours(0, 0, 0, 0)

    return {
      userId: user.id,
      timezone: user.timezone,
      updatedAt: user.updatedAt,
      goalResetTime: '00:00:00 GMT',
      nextGoalReset: nextResetLocal.toISOString()
    }
  }

  /**
   * Archive completed daily goals to history (called by scheduled job)
   */
  static async archiveGoalsForDate(date: Date, timezone: string): Promise<void> {
    const dateString = date.toISOString().split('T')[0]
    
    // Get all users in this timezone
    const users = await prisma.user.findMany({
      where: { timezone },
      select: { id: true }
    })

    for (const user of users) {
      // Get all goal progress for this user and date
      const goalProgressEntries = await prisma.dailyGoalProgress.findMany({
        where: {
          userId: user.id,
          goalDate: date
        }
      })

      // Archive each goal progress to history
      for (const progress of goalProgressEntries) {
        const completionRate = progress.targetValue.toNumber() > 0 
          ? Math.round((progress.currentValue.toNumber() / progress.targetValue.toNumber()) * 100)
          : 0

        await prisma.dailyGoalHistory.create({
          data: {
            userId: progress.userId,
            taskId: progress.taskId,
            goalDate: progress.goalDate,
            targetValue: progress.targetValue,
            finalValue: progress.currentValue,
            completionRate: new Decimal(completionRate),
            status: progress.status,
            completedAt: progress.completedAt
          }
        })
      }

      // Remove the archived progress entries
      await prisma.dailyGoalProgress.deleteMany({
        where: {
          userId: user.id,
          goalDate: date
        }
      })
    }
  }

  /**
   * Get goal completion history for a user
   */
  static async getGoalHistory(
    userId: number,
    startDate?: Date,
    endDate?: Date,
    taskId?: number,
    limit: number = 30,
    offset: number = 0
  ) {
    const whereClause: any = { userId }
    
    if (startDate && endDate) {
      whereClause.goalDate = {
        gte: startDate,
        lte: endDate
      }
    }
    
    if (taskId) {
      whereClause.taskId = taskId
    }

    const [history, totalCount] = await Promise.all([
      prisma.dailyGoalHistory.findMany({
        where: whereClause,
        include: {
          task: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          goalDate: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.dailyGoalHistory.count({ where: whereClause })
    ])

    // Calculate summary statistics
    const completedDays = history.filter(h => h.status === 'COMPLETED' || h.status === 'EXCEEDED').length
    const averageCompletionRate = history.length > 0 
      ? history.reduce((sum, h) => sum + h.completionRate.toNumber(), 0) / history.length
      : 0

    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Sort by date ascending for streak calculation
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.goalDate).getTime() - new Date(b.goalDate).getTime()
    )

    for (let i = 0; i < sortedHistory.length; i++) {
      if (sortedHistory[i].status === 'COMPLETED' || sortedHistory[i].status === 'EXCEEDED') {
        tempStreak++
        if (i === sortedHistory.length - 1) {
          currentStreak = tempStreak
        }
      } else {
        if (i === sortedHistory.length - 1 && tempStreak > 0) {
          currentStreak = 0
        }
        tempStreak = 0
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    return {
      history: history.map(h => ({
        goalDate: h.goalDate.toISOString().split('T')[0],
        taskId: h.taskId,
        taskName: h.task.name,
        targetValue: h.targetValue.toNumber(),
        finalValue: h.finalValue.toNumber(),
        completionRate: h.completionRate.toNumber(),
        status: h.status,
        completedAt: h.completedAt || undefined
      })),
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalDays: history.length,
        completedDays,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
        streak: {
          current: currentStreak,
          longest: longestStreak
        }
      }
    }
  }
}