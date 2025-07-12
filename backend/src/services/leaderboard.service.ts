import { prisma } from '../config/database'
import { LeaderboardEntry } from '../types/progress'
import { AppError } from '../middleware/errorHandler'

export class LeaderboardService {
  static async getOverallLeaderboard(): Promise<LeaderboardEntry[]> {
    const scores = await prisma.userScore.findMany({
      where: {
        taskId: null  // Overall scores only
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        totalPoints: 'desc'
      }
    })

    return scores.map((score, index) => ({
      rank: index + 1,
      userId: score.user.id,
      username: score.user.username,
      totalPoints: score.totalPoints
    }))
  }

  static async getTaskLeaderboard(taskId: number): Promise<LeaderboardEntry[]> {
    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const scores = await prisma.userScore.findMany({
      where: {
        taskId: taskId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        totalPoints: 'desc'
      }
    })

    return scores.map((score, index) => ({
      rank: index + 1,
      userId: score.user.id,
      username: score.user.username,
      totalPoints: score.totalPoints,
      totalValue: score.totalValue.toNumber()
    }))
  }
}