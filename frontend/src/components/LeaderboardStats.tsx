import React from 'react'

interface LeaderboardStatsProps {
  userRank: number
  totalUsers: number
  userPoints: number
  topUserPoints: number
}

export const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({
  userRank,
  totalUsers,
  userPoints,
  topUserPoints
}) => {
  const percentile = userRank > 0 
    ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100)
    : 0
    
  const pointsGap = topUserPoints - userPoints
  const progress = topUserPoints > 0 ? (userPoints / topUserPoints) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-600">Your Rank</p>
        <p className="text-4xl font-bold text-accent-600 mt-2">
          #{userRank || '-'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          of {totalUsers} users
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-600">Top Percentile</p>
        <p className="text-4xl font-bold text-green-600 mt-2">
          {percentile}%
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Better than {100 - percentile}%
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-600">Points to #1</p>
        <p className="text-4xl font-bold text-orange-600 mt-2">
          {pointsGap > 0 ? pointsGap : 0}
        </p>
        <div className="mt-3">
          <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-accent-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}