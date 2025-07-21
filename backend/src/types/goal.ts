import { GoalType, GoalStatus } from '@prisma/client'

export interface LogProgressInput {
  taskId: number
  value: number
  date?: string
}

export interface UpdateGoalInput {
  targetValue?: number
  targetType?: GoalType
  isActive?: boolean
}

export interface DailyGoalProgress {
  id: number
  userId: number
  taskId: number
  goalDate: string
  currentValue: number
  targetValue: number
  status: GoalStatus
  completionRate: number
  completedAt?: Date
  lastUpdated: Date
}

export interface DailyGoalWithProgress extends DailyGoalProgress {
  taskName: string
  unit: string
  targetType: GoalType
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

export interface GoalAnalytics {
  period: string
  globalStats: {
    totalActiveUsers: number
    averageGoalsCompleted: number
    topPerformingTask: {
      taskId: number
      taskName: string
      completionRate: number
    }
  }
  taskBreakdown: {
    taskId: number
    taskName: string
    targetValue: number
    averageCompletion: number
    completionRate: number
    totalCompletions: number
  }[]
  trends: {
    dailyCompletionRates: number[]
  }
}

export interface UpdateTimezoneInput {
  timezone: string
}

export interface GoalHistoryQuery {
  startDate?: string
  endDate?: string
  taskId?: number
  limit?: number
  offset?: number
}