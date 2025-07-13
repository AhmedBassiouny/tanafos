export interface User {
  id: number
  username: string
  email: string
  createdAt: string
}

export interface Task {
  id: number
  name: string
  unit: string
  pointsPerUnit: number
  displayOrder: number
}

export interface ProgressLog {
  id: number
  taskId: number
  taskName: string
  value: number
  pointsEarned: number
  loggedDate: string
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  username: string
  totalPoints: number
  totalValue?: number
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