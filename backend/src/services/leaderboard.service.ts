import { prisma } from '../config/database'
import { LeaderboardEntry } from '../types/progress'
import { AppError } from '../middleware/errorHandler'
import { NameAnonymizerService } from './name-anonymizer.service'

// Simple in-memory cache with TTL
class Cache {
  private static data = new Map<string, { value: any; expiry: number }>()
  
  static set(key: string, value: any, ttlMs: number = 300000) { // 5 minutes default
    this.data.set(key, { value, expiry: Date.now() + ttlMs })
  }
  
  static get(key: string) {
    const cached = this.data.get(key)
    if (!cached || cached.expiry < Date.now()) {
      this.data.delete(key)
      return null
    }
    return cached.value
  }
  
  static delete(key: string) {
    this.data.delete(key)
  }
  
  static clear() {
    this.data.clear()
  }
}

export class LeaderboardService {
  static async getOverallLeaderboard(sessionId?: string, currentUserId?: number): Promise<LeaderboardEntry[]> {
    const cacheKey = 'overall_leaderboard'
    let leaderboardEntries = Cache.get(cacheKey)
    
    if (!leaderboardEntries) {
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
        },
        take: 100 // Limit to top 100 for performance
      })

      leaderboardEntries = scores.map((score, index) => ({
        rank: index + 1,
        userId: score.user.id,
        username: score.user.username,
        totalPoints: score.totalPoints
      }))
      
      Cache.set(cacheKey, leaderboardEntries, 180000) // 3 minutes cache
    }

    // Apply name anonymization if session info provided
    if (sessionId && currentUserId !== undefined) {
      return NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries)
    }

    return leaderboardEntries
  }

  static async getTaskLeaderboard(taskId: number, sessionId?: string, currentUserId?: number): Promise<LeaderboardEntry[]> {
    const cacheKey = `task_leaderboard_${taskId}`
    let leaderboardEntries = Cache.get(cacheKey)
    
    if (!leaderboardEntries) {
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
        },
        take: 100 // Limit to top 100 for performance
      })

      leaderboardEntries = scores.map((score, index) => ({
        rank: index + 1,
        userId: score.user.id,
        username: score.user.username,
        totalPoints: score.totalPoints,
        totalValue: score.totalValue.toNumber()
      }))
      
      Cache.set(cacheKey, leaderboardEntries, 180000) // 3 minutes cache
    }

    // Apply name anonymization if session info provided
    if (sessionId && currentUserId !== undefined) {
      return NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries)
    }

    return leaderboardEntries
  }
  
  // Method to invalidate cache when scores are updated
  static invalidateCache(taskId?: number) {
    Cache.delete('overall_leaderboard')
    if (taskId) {
      Cache.delete(`task_leaderboard_${taskId}`)
    }
  }
  
  // Method to clear all cache (useful for testing)
  static clearAllCache() {
    Cache.clear()
  }
}