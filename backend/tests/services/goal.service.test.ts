import { GoalService } from '../../src/services/goal.service'
import { createTestUser, createTestTask, cleanDatabase, prisma } from '../utils/testHelpers'
import { Decimal } from '@prisma/client/runtime/library'

describe('GoalService', () => {
  let testUser: any
  let testTask1: any
  let testTask2: any

  beforeEach(async () => {
    await cleanDatabase()
    
    testUser = await createTestUser()
    testTask1 = await createTestTask({
      name: 'Prayer on Time',
      unit: 'prayers',
      pointsPerUnit: 5
    })
    testTask2 = await createTestTask({
      name: 'Quran Reading',
      unit: 'pages',
      pointsPerUnit: 3
    })

    // Create daily goals for test tasks
    await prisma.dailyGoal.createMany({
      data: [
        {
          taskId: testTask1.id,
          targetValue: new Decimal(5),
          targetType: 'EXACT'
        },
        {
          taskId: testTask2.id,
          targetValue: new Decimal(2),
          targetType: 'MINIMUM'
        }
      ]
    })
  })

  describe('getUserLocalDate', () => {
    it('should return correct date for valid timezone', () => {
      const result = GoalService.getUserLocalDate('Asia/Dubai')
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
    })

    it('should fallback to UTC for invalid timezone', () => {
      const result = GoalService.getUserLocalDate('Invalid/Timezone')
      expect(result).toBeInstanceOf(Date)
      expect(result.getHours()).toBe(0)
    })
  })

  describe('isValidTimezone', () => {
    it('should return true for valid IANA timezones', () => {
      expect(GoalService.isValidTimezone('Asia/Dubai')).toBe(true)
      expect(GoalService.isValidTimezone('Europe/London')).toBe(true)
      expect(GoalService.isValidTimezone('America/New_York')).toBe(true)
      expect(GoalService.isValidTimezone('UTC')).toBe(true)
    })

    it('should return false for invalid timezones', () => {
      expect(GoalService.isValidTimezone('Invalid/Timezone')).toBe(false)
      expect(GoalService.isValidTimezone('Not-A-Timezone')).toBe(false)
      expect(GoalService.isValidTimezone('')).toBe(false)
    })
  })

  describe('calculateGoalStatus', () => {
    it('should calculate NOT_STARTED status for zero progress', () => {
      const result = GoalService.calculateGoalStatus(0, 5, 'EXACT')
      expect(result.status).toBe('NOT_STARTED')
      expect(result.completionRate).toBe(0)
      expect(result.completedAt).toBeUndefined()
    })

    it('should calculate IN_PROGRESS status for partial progress', () => {
      const result = GoalService.calculateGoalStatus(3, 5, 'EXACT')
      expect(result.status).toBe('IN_PROGRESS')
      expect(result.completionRate).toBe(60)
      expect(result.completedAt).toBeUndefined()
    })

    it('should calculate COMPLETED status for exact target met', () => {
      const result = GoalService.calculateGoalStatus(5, 5, 'EXACT')
      expect(result.status).toBe('COMPLETED')
      expect(result.completionRate).toBe(100)
      expect(result.completedAt).toBeInstanceOf(Date)
    })

    it('should calculate EXCEEDED status for target exceeded (EXACT type)', () => {
      const result = GoalService.calculateGoalStatus(7, 5, 'EXACT')
      expect(result.status).toBe('EXCEEDED')
      expect(result.completionRate).toBe(140)
      expect(result.completedAt).toBeInstanceOf(Date)
    })

    it('should calculate COMPLETED status for minimum target met', () => {
      const result = GoalService.calculateGoalStatus(2, 2, 'MINIMUM')
      expect(result.status).toBe('COMPLETED')
      expect(result.completionRate).toBe(100)
    })

    it('should calculate EXCEEDED status for minimum target exceeded', () => {
      const result = GoalService.calculateGoalStatus(3, 2, 'MINIMUM')
      expect(result.status).toBe('EXCEEDED')
      expect(result.completionRate).toBe(150)
    })

    it('should calculate COMPLETED status for maximum target not exceeded', () => {
      const result = GoalService.calculateGoalStatus(3, 5, 'MAXIMUM')
      expect(result.status).toBe('COMPLETED')
      expect(result.completionRate).toBe(100)
    })

    it('should calculate EXCEEDED status for maximum target exceeded', () => {
      const result = GoalService.calculateGoalStatus(7, 5, 'MAXIMUM')
      expect(result.status).toBe('EXCEEDED')
      expect(result.completionRate).toBe(60) // 100 - ((7-5)/5)*100
    })

    it('should preserve existing completedAt date', () => {
      const existingDate = new Date('2025-07-20T10:00:00Z')
      const result = GoalService.calculateGoalStatus(5, 5, 'EXACT', existingDate)
      expect(result.completedAt).toBe(existingDate)
    })
  })

  describe('calculateDailyProgress', () => {
    it('should calculate progress for user with no existing progress', async () => {
      const goalDate = new Date('2025-07-20')
      
      const result = await GoalService.calculateDailyProgress(
        testUser.id,
        goalDate,
        'UTC'
      )

      expect(result).toHaveLength(2)
      
      // Check first goal (Prayer - EXACT target)
      const prayerGoal = result.find(g => g.taskId === testTask1.id)
      expect(prayerGoal).toBeDefined()
      expect(prayerGoal!.currentValue).toBe(0)
      expect(prayerGoal!.targetValue).toBe(5)
      expect(prayerGoal!.status).toBe('NOT_STARTED')
      expect(prayerGoal!.completionRate).toBe(0)

      // Check second goal (Quran - MINIMUM target)
      const quranGoal = result.find(g => g.taskId === testTask2.id)
      expect(quranGoal).toBeDefined()
      expect(quranGoal!.currentValue).toBe(0)
      expect(quranGoal!.targetValue).toBe(2)
      expect(quranGoal!.status).toBe('NOT_STARTED')
      expect(quranGoal!.completionRate).toBe(0)
    })

    it('should calculate progress with existing progress logs', async () => {
      const goalDate = new Date('2025-07-20')
      
      // Create progress logs
      await prisma.progressLog.createMany({
        data: [
          {
            userId: testUser.id,
            taskId: testTask1.id,
            value: new Decimal(3),
            pointsEarned: 15,
            loggedDate: goalDate
          },
          {
            userId: testUser.id,
            taskId: testTask2.id,
            value: new Decimal(2),
            pointsEarned: 6,
            loggedDate: goalDate
          }
        ]
      })

      const result = await GoalService.calculateDailyProgress(
        testUser.id,
        goalDate,
        'UTC'
      )

      expect(result).toHaveLength(2)
      
      // Check prayer goal (3/5 - IN_PROGRESS)
      const prayerGoal = result.find(g => g.taskId === testTask1.id)
      expect(prayerGoal!.currentValue).toBe(3)
      expect(prayerGoal!.status).toBe('IN_PROGRESS')
      expect(prayerGoal!.completionRate).toBe(60)

      // Check quran goal (2/2 - COMPLETED)
      const quranGoal = result.find(g => g.taskId === testTask2.id)
      expect(quranGoal!.currentValue).toBe(2)
      expect(quranGoal!.status).toBe('COMPLETED')
      expect(quranGoal!.completionRate).toBe(100)
    })

    it('should handle different timezones correctly', async () => {
      // Test with Dubai timezone (UTC+4)
      const result = await GoalService.calculateDailyProgress(
        testUser.id,
        undefined, // Use current date
        'Asia/Dubai'
      )

      expect(result).toHaveLength(2)
      expect(result[0].goalDate).toBeDefined()
      
      // Verify the date calculation works for different timezones
      const goalDate = result[0].goalDate
      expect(goalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    })

    it('should throw error for non-existent user', async () => {
      await expect(
        GoalService.calculateDailyProgress(99999, new Date(), 'UTC')
      ).rejects.toThrow('User not found')
    })
  })

  describe('checkGoalCompletion', () => {
    it('should detect newly completed goal', async () => {
      const goalDate = new Date('2025-07-20')
      
      // Create initial progress log (partial)
      await prisma.progressLog.create({
        data: {
          userId: testUser.id,
          taskId: testTask1.id,
          value: new Decimal(3),
          pointsEarned: 15,
          loggedDate: goalDate
        }
      })

      // Calculate initial progress to create progress entry
      await GoalService.calculateDailyProgress(testUser.id, goalDate, 'UTC')

      // Update the existing progress log to complete the goal
      await prisma.progressLog.updateMany({
        where: {
          userId: testUser.id,
          taskId: testTask1.id,
          loggedDate: goalDate
        },
        data: {
          value: new Decimal(5), // Complete the goal
          pointsEarned: 25
        }
      })

      const result = await GoalService.checkGoalCompletion(
        testUser.id,
        testTask1.id,
        goalDate,
        'UTC'
      )

      expect(result).toBeDefined()
      expect(result!.goalCompleted).toBe(true)
      expect(result!.targetReached).toBe(true)
      expect(result!.previousStatus).toBe('IN_PROGRESS')
      expect(result!.newStatus).toBe('COMPLETED')
      expect(result!.completionRate).toBe(100)
    })

    it('should not trigger completion for already completed goals', async () => {
      const goalDate = new Date('2025-07-20')
      
      // Create progress that completes the goal
      await prisma.progressLog.create({
        data: {
          userId: testUser.id,
          taskId: testTask1.id,
          value: new Decimal(5),
          pointsEarned: 25,
          loggedDate: goalDate
        }
      })

      // Calculate progress to mark as completed
      await GoalService.calculateDailyProgress(testUser.id, goalDate, 'UTC')

      // Check completion again (should not trigger)
      const result = await GoalService.checkGoalCompletion(
        testUser.id,
        testTask1.id,
        goalDate,
        'UTC'
      )

      expect(result!.goalCompleted).toBe(false)
      expect(result!.targetReached).toBe(true)
      expect(result!.previousStatus).toBe('COMPLETED')
      expect(result!.newStatus).toBe('COMPLETED')
    })

    it('should return null for non-existent goal', async () => {
      const result = await GoalService.checkGoalCompletion(
        testUser.id,
        99999, // Non-existent task
        new Date(),
        'UTC'
      )

      expect(result).toBeNull()
    })
  })

  describe('getDailyGoalsForUser', () => {
    it('should return complete daily goals summary', async () => {
      const goalDate = new Date('2025-07-20')
      
      // Create some progress
      await prisma.progressLog.create({
        data: {
          userId: testUser.id,
          taskId: testTask1.id,
          value: new Decimal(5), // Complete this goal
          pointsEarned: 25,
          loggedDate: goalDate
        }
      })

      const result = await GoalService.getDailyGoalsForUser(
        testUser.id,
        goalDate,
        'UTC'
      )

      expect(result.goalDate).toBe('2025-07-20')
      expect(result.userTimezone).toBe('UTC')
      expect(result.localTime).toBeDefined()
      expect(result.overallProgress.total).toBe(2)
      expect(result.overallProgress.completed).toBe(1)
      expect(result.overallProgress.completionRate).toBe(50)
      expect(result.goals).toHaveLength(2)

      // Verify the completed goal
      const completedGoal = result.goals.find(g => g.status === 'COMPLETED')
      expect(completedGoal).toBeDefined()
      expect(completedGoal!.taskId).toBe(testTask1.id)
      expect(completedGoal!.currentValue).toBe(5)
    })

    it('should handle invalid timezone', async () => {
      await expect(
        GoalService.getDailyGoalsForUser(testUser.id, new Date(), 'Invalid/Timezone')
      ).rejects.toThrow('Invalid timezone format')
    })

    it('should use user\'s stored timezone by default', async () => {
      // Update user's timezone
      await prisma.user.update({
        where: { id: testUser.id },
        data: { timezone: 'Asia/Dubai' }
      })

      const result = await GoalService.getDailyGoalsForUser(testUser.id)
      expect(result.userTimezone).toBe('Asia/Dubai')
    })
  })

  describe('updateUserTimezone', () => {
    it('should update user timezone successfully', async () => {
      const result = await GoalService.updateUserTimezone(testUser.id, 'Europe/London')
      
      expect(result.userId).toBe(testUser.id)
      expect(result.timezone).toBe('Europe/London')
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(result.goalResetTime).toBe('00:00:00 GMT')
      expect(result.nextGoalReset).toBeDefined()

      // Verify database was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })
      expect(updatedUser!.timezone).toBe('Europe/London')
    })

    it('should reject invalid timezone', async () => {
      await expect(
        GoalService.updateUserTimezone(testUser.id, 'Invalid/Timezone')
      ).rejects.toThrow('Invalid timezone format')
    })
  })

  describe('getGoalHistory', () => {
    beforeEach(async () => {
      // Create some historical data
      const historyData = [
        {
          userId: testUser.id,
          taskId: testTask1.id,
          goalDate: new Date('2025-07-15'),
          targetValue: new Decimal(5),
          finalValue: new Decimal(5),
          completionRate: new Decimal(100),
          status: 'COMPLETED' as const,
          completedAt: new Date('2025-07-15T17:30:00Z')
        },
        {
          userId: testUser.id,
          taskId: testTask1.id,
          goalDate: new Date('2025-07-16'),
          targetValue: new Decimal(5),
          finalValue: new Decimal(3),
          completionRate: new Decimal(60),
          status: 'IN_PROGRESS' as const,
          completedAt: null
        },
        {
          userId: testUser.id,
          taskId: testTask2.id,
          goalDate: new Date('2025-07-15'),
          targetValue: new Decimal(2),
          finalValue: new Decimal(3),
          completionRate: new Decimal(150),
          status: 'EXCEEDED' as const,
          completedAt: new Date('2025-07-15T14:00:00Z')
        }
      ]

      await prisma.dailyGoalHistory.createMany({ data: historyData })
    })

    it('should return goal history with summary statistics', async () => {
      const result = await GoalService.getGoalHistory(testUser.id)
      
      expect(result.history).toHaveLength(3)
      expect(result.summary.totalDays).toBe(3)
      expect(result.summary.completedDays).toBe(2) // COMPLETED + EXCEEDED
      expect(result.summary.averageCompletionRate).toBeCloseTo(103.33)
      expect(result.summary.streak.current).toBeGreaterThanOrEqual(0)
      expect(result.summary.streak.longest).toBeGreaterThanOrEqual(0)
      
      expect(result.pagination.total).toBe(3)
      expect(result.pagination.limit).toBe(30)
      expect(result.pagination.offset).toBe(0)
      expect(result.pagination.hasMore).toBe(false)
    })

    it('should filter by date range', async () => {
      const startDate = new Date('2025-07-15')
      const endDate = new Date('2025-07-15')
      
      const result = await GoalService.getGoalHistory(
        testUser.id,
        startDate,
        endDate
      )
      
      expect(result.history).toHaveLength(2) // Both goals on 2025-07-15
      result.history.forEach(h => {
        expect(h.goalDate).toBe('2025-07-15')
      })
    })

    it('should filter by task ID', async () => {
      const result = await GoalService.getGoalHistory(
        testUser.id,
        undefined,
        undefined,
        testTask1.id
      )
      
      expect(result.history).toHaveLength(2) // Two entries for testTask1
      result.history.forEach(h => {
        expect(h.taskId).toBe(testTask1.id)
      })
    })

    it('should handle pagination', async () => {
      const result = await GoalService.getGoalHistory(
        testUser.id,
        undefined,
        undefined,
        undefined,
        2, // limit
        1  // offset
      )
      
      expect(result.history).toHaveLength(2)
      expect(result.pagination.limit).toBe(2)
      expect(result.pagination.offset).toBe(1)
      expect(result.pagination.hasMore).toBe(false)
    })
  })
})