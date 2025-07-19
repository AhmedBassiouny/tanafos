import React from 'react'
import { Card } from './ui'

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="text-center">
        <p className="text-sm text-gray-600">Your Rank</p>
        <p className="text-3xl font-bold text-primary-600 mt-1">
          #{userRank || '-'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          out of {totalUsers} users
        </p>
      </Card>
      
      <Card className="text-center">
        <p className="text-sm text-gray-600">Percentile</p>
        <p className="text-3xl font-bold text-green-600 mt-1">
          Top {percentile}%
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Better than {100 - percentile}% of users
        </p>
      </Card>
      
      <Card className="text-center">
        <p className="text-sm text-gray-600">Points to #1</p>
        <p className="text-3xl font-bold text-orange-600 mt-1">
          {pointsGap > 0 ? pointsGap : 0}
        </p>
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
