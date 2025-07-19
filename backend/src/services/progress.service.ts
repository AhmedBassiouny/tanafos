import { prisma } from '../config/database'
import { LogProgressInput } from '../types/progress'
import { AppError } from '../middleware/errorHandler'
import { Decimal } from '@prisma/client/runtime/library'
import { LeaderboardService } from './leaderboard.service'

export class ProgressService {
  static async logProgress(userId: number, data: LogProgressInput) {
    // Verify task exists and is active
    const task = await prisma.task.findFirst({
      where: {
        id: data.taskId,
        isActive: true
      }
    })

    if (!task) {
      throw new AppError('Task not found or inactive', 404)
    }

    // Calculate points
    const pointsEarned = Math.round(data.value * task.pointsPerUnit)

    // Use date at start of day for consistency
    const logDate = new Date(data.date || new Date())
    logDate.setHours(0, 0, 0, 0)

    // Check if user already logged progress for this task today
    const existingLog = await prisma.progressLog.findFirst({
      where: {
        userId,
        taskId: data.taskId,
        loggedDate: logDate
      }
    })

    if (existingLog) {
      throw new AppError('Progress already logged for this task today', 400)
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create progress log
      const progressLog = await tx.progressLog.create({
        data: {
          userId,
          taskId: data.taskId,
          value: new Decimal(data.value),
          pointsEarned,
          loggedDate: logDate
        }
      })

      // Update or create task-specific score
      await tx.userScore.upsert({
        where: {
          userId_taskId: {
            userId,
            taskId: data.taskId
          }
        },
        create: {
          userId,
          taskId: data.taskId,
          totalPoints: pointsEarned,
          totalValue: new Decimal(data.value)
        },
        update: {
          totalPoints: {
            increment: pointsEarned
          },
          totalValue: {
            increment: data.value
          }
        }
      })

      // Update or create overall score (taskId = null)
      const existingOverallScore = await tx.userScore.findFirst({
        where: {
          userId,
          taskId: null
        }
      })

      if (existingOverallScore) {
        await tx.userScore.update({
          where: { id: existingOverallScore.id },
          data: {
            totalPoints: {
              increment: pointsEarned
            }
          }
        })
      } else {
        await tx.userScore.create({
          data: {
            userId,
            taskId: null,
            totalPoints: pointsEarned,
            totalValue: new Decimal(0)
          }
        })
      }

      return progressLog
    })

    // Invalidate leaderboard cache since scores were updated
    LeaderboardService.invalidateCache(data.taskId)

    return {
      id: result.id,
      taskId: result.taskId,
      value: result.value.toNumber(),
      pointsEarned: result.pointsEarned,
      loggedDate: result.loggedDate,
      task
    }
  }

  static async getUserStats(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userScores: {
          include: {
            task: true
          }
        }
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Get overall score
    const overallScore = user.userScores.find(score => score.taskId === null)
    const totalPoints = overallScore?.totalPoints || 0

    // Get task-specific stats
    const taskStats = user.userScores
      .filter(score => score.taskId !== null && score.task)
      .map(score => ({
        taskId: score.taskId!,
        taskName: score.task!.name,
        totalValue: score.totalValue.toNumber(),
        totalPoints: score.totalPoints
      }))

    return {
      userId: user.id,
      username: user.username,
      totalPoints,
      taskStats
    }
  }
}