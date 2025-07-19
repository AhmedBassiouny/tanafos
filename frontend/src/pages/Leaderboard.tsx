import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  leaderboard as leaderboardApi,
  tasks as tasksApi,
  user as userApi
} from '../lib/api'
import type { LeaderboardEntry, Task, UserStats } from '../types'
import { Loading, Error, Card } from '../components/ui'
import { LeaderboardTable } from '../components/LeaderboardTable'
import { LeaderboardStats } from '../components/LeaderboardStats'

export const Leaderboard: React.FC = () => {
  const { user } = useAuth()
  
  // State
  const [activeTab, setActiveTab] = useState<'overall' | number>('overall')
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([])
  const [taskLeaderboards, setTaskLeaderboards] = useState<Map<number, LeaderboardEntry[]>>(new Map())
  const [tasks, setTasks] = useState<Task[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Fetch tasks and overall leaderboard
      const [tasksRes, overallRes, statsRes] = await Promise.all([
        tasksApi.getAll(),
        leaderboardApi.getOverall(),
        userApi.getStats()
      ])
      
      setTasks(tasksRes.data)
      setOverallLeaderboard(overallRes.data)
      setUserStats(statsRes.data)
      
    } catch (err) {
      setError('Failed to load leaderboard data')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch task-specific leaderboard when tab changes
  const fetchTaskLeaderboard = async (taskId: number) => {
    // Check if already cached
    if (taskLeaderboards.has(taskId)) return
    
    try {
      const response = await leaderboardApi.getByTask(taskId)
      setTaskLeaderboards(prev => new Map(prev).set(taskId, response.data))
    } catch (err) {
      console.error('Failed to load task leaderboard:', err)
    }
  }

  // Fetch data on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void fetchData()
  }, [])

  // Fetch task leaderboard when activeTab changes
  useEffect(() => {
    if (typeof activeTab === 'number') {
      void fetchTaskLeaderboard(activeTab)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Get current leaderboard data
  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    if (activeTab === 'overall') return overallLeaderboard
    return taskLeaderboards.get(activeTab) || []
  }

  // Get current user data
  const getUserRank = (): number => {
    const leaderboard = getCurrentLeaderboard()
    const entry = leaderboard.find(e => e.userId === user?.id)
    return entry?.rank || 0
  }

  const getUserPoints = (): number => {
    if (activeTab === 'overall') return userStats?.totalPoints || 0
    const taskStat = userStats?.taskStats?.find(s => s.taskId === activeTab)
    return taskStat?.totalPoints || 0
  }

  const getActiveTask = (): Task | undefined => {
    return tasks.find(t => t.id === activeTab)
  }

  if (isLoading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchData} />

  const currentLeaderboard = getCurrentLeaderboard()
  const userRank = getUserRank()
  const userPoints = getUserPoints()
  const topUserPoints = currentLeaderboard[0]?.totalPoints || 0
  const activeTask = getActiveTask()
  const pointsGap = topUserPoints - userPoints

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-slate-600 mt-2">
          See how you rank against other users
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overall')}
            className={`
              whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'overall'
                ? 'border-accent-500 text-accent-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }
            `}
          >
            Overall
          </button>
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => setActiveTab(task.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === task.id
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {task.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Stats Cards */}
      <LeaderboardStats
        userRank={userRank}
        totalUsers={currentLeaderboard.length}
        userPoints={userPoints}
        topUserPoints={topUserPoints}
      />

      {/* Leaderboard Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeTab === 'overall' ? 'Overall Rankings' : `${activeTask?.name} Rankings`}
          </h2>
          {activeTask && (
            <p className="text-sm text-slate-500 mt-1">
              Ranked by total {activeTask.unit} ({activeTask.pointsPerUnit} points per {activeTask.unit})
            </p>
          )}
        </div>
        
        {currentLeaderboard.length > 0 ? (
          <LeaderboardTable
            entries={currentLeaderboard}
            showValue={activeTab !== 'overall'}
            valueLabel={activeTask?.unit || 'Value'}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            No data available yet
          </div>
        )}
      </Card>

      {/* Motivation Message */}
      {userRank > 3 && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-primary-800">
                Keep going! You need <strong>{pointsGap} more points</strong> to reach the top 3.
                {activeTab !== 'overall' && activeTask && (
                  <span> That's about {Math.ceil(pointsGap / activeTask.pointsPerUnit)} more {activeTask.unit}!</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}