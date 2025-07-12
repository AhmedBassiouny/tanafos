export interface LogProgressInput {
  taskId: number
  value: number
  date?: Date  // Optional, defaults to today
}

export interface UserStats {
  userId: number
  username: string
  totalPoints: number
  taskStats: {
    taskId: number
    taskName: string
    totalValue: number
    totalPoints: number
  }[]
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  username: string
  totalPoints: number
  totalValue?: number  // For task-specific leaderboards
}