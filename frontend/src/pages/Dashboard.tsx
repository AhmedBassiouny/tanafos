import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  tasks as tasksApi, 
  user as userApi, 
  progress as progressApi,
  leaderboard as leaderboardApi 
} from '../lib/api'
import type { Task, UserStats, ProgressLog, LeaderboardEntry } from '../types'
import { Loading, Error, Card } from '../components/ui'
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
      <h1 className="text-3xl font-bold text-slate-900">
        Welcome back, {user?.username}
      </h1>
      <p className="text-slate-600 mt-1">
        Track your progress and climb the leaderboard
      </p>
    </div>

    {/* Stats Overview */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        title="Tasks Today"
        value={todayProgress.length}
        subtitle="Completed"
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
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Today's Activity</h2>
        <div className="space-y-3">
          {todayProgress.map((progress) => (
            <div key={progress.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{progress.taskName}</p>
                  <p className="text-sm text-slate-500">
                    {progress.value} {tasks.find(t => t.id === progress.taskId)?.unit}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-accent-600">
                +{progress.pointsEarned} pts
              </span>
            </div>
          ))}
        </div>
      </Card>
    )}

    {/* Tasks */}
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Daily Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskCard
              task={task}
              todayProgress={getTaskProgress(task.id)}
              onLogProgress={handleLogProgress}
            />
          </div>
        ))}
      </div>
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