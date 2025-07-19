import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  tasks as tasksApi, 
  user as userApi, 
  progress as progressApi,
  leaderboard as leaderboardApi 
} from '../lib/api'
import type { Task, UserStats, ProgressLog, LeaderboardEntry } from '../types'
import { Loading, Error, Card, EmptyState } from '../components/ui'
import { TaskCard } from '../components/TaskCard'
import { StatsCard } from '../components/StatsCard'
import { LogProgressModal } from '../components/LogProgressModal'

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [todayProgress, setTodayProgress] = useState<ProgressLog[]>([])
  const [userRank, setUserRank] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Fetch in parallel
      const [tasksRes, statsRes, todayRes, leaderboardRes] = await Promise.all([
        tasksApi.getAll(),
        userApi.getStats(),
        progressApi.getToday(),
        leaderboardApi.getOverall()
      ])
      
      setTasks(tasksRes.data)
      setUserStats(statsRes.data)
      setTodayProgress(todayRes.data)
      
      // Find user's rank
      const rank = leaderboardRes.data.findIndex(
        (entry: LeaderboardEntry) => entry.userId === user?.id
      ) + 1
      setUserRank(rank)
      
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    void fetchData()
    // We intentionally only want to fetch on mount, not on every user change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogProgress = (task: Task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleProgressSuccess = () => {
    // Refresh data after logging progress
    fetchData()
  }

  // Calculate today's progress for each task
  const getTaskProgress = (taskId: number): number => {
    const progress = todayProgress.find(p => p.taskId === taskId)
    return progress ? progress.value : 0
  }

  if (isLoading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchData} />

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Track your progress and climb the leaderboard
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Points"
          value={userStats?.totalPoints || 0}
          subtitle="All time"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Current Rank"
          value={userRank > 0 ? `#${userRank}` : '-'}
          subtitle="Overall leaderboard"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Tasks Completed"
          value={todayProgress.length}
          subtitle="Today"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Today's Progress Summary */}
      {todayProgress.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
          <div className="space-y-2">
            {todayProgress.map((progress) => (
              <div key={progress.id} className="flex justify-between items-center py-2">
                <span className="text-gray-700">{progress.taskName}</span>
                <span className="font-medium text-primary-600">
                  {progress.value} {tasks.find(t => t.id === progress.taskId)?.unit} 
                  <span className="text-gray-500 ml-2">({progress.pointsEarned} pts)</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tasks</h2>
        {tasks.length === 0 ? (
          <EmptyState
            title="No tasks available"
            description="Check back later for available tasks"
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                todayProgress={getTaskProgress(task.id)}
                onLogProgress={handleLogProgress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Modal */}
      <LogProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSuccess={handleProgressSuccess}
      />
    </div>
  )
}