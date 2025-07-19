import { useCache, CacheManager } from './useCache'
import { tasks, progress, leaderboard, user } from '../lib/api'
import type { Task, LeaderboardEntry, UserStats } from '../types'

// Tasks hooks
export function useTasks() {
  return useCache<{ data: Task[] }>('tasks', tasks.getAll, { ttl: 600000 }) // 10 minutes
}

// Progress hooks
export function useTodayProgress() {
  return useCache('progress/today', progress.getToday, { ttl: 60000 }) // 1 minute
}

// Leaderboard hooks
export function useOverallLeaderboard() {
  return useCache<LeaderboardEntry[]>(
    'leaderboard/overall', 
    () => leaderboard.getOverall().then(res => res.data),
    { ttl: 180000, refreshInterval: 300000 } // 3 minutes cache, refresh every 5 minutes
  )
}

export function useTaskLeaderboard(taskId: number | null) {
  return useCache<LeaderboardEntry[]>(
    `leaderboard/task/${taskId}`,
    () => taskId ? leaderboard.getByTask(taskId).then(res => res.data) : Promise.resolve([]),
    { 
      ttl: 180000, // 3 minutes
      enabled: !!taskId
    }
  )
}

// User hooks
export function useUserStats() {
  return useCache<UserStats>(
    'user/stats',
    () => user.getStats().then(res => res.data),
    { ttl: 120000 } // 2 minutes
  )
}

// Progress logging with cache invalidation
export async function logProgress(data: { taskId: number; value: number }) {
  const result = await progress.log(data)
  
  // Invalidate relevant caches
  CacheManager.invalidate('progress/today')
  CacheManager.invalidate('user/stats')
  CacheManager.invalidate('leaderboard/overall')
  CacheManager.invalidate(`leaderboard/task/${data.taskId}`)
  
  return result
}