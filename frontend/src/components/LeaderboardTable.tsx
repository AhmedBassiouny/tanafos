import React from 'react'
import type { LeaderboardEntry } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  showValue?: boolean
  valueLabel?: string
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  entries, 
  showValue = false,
  valueLabel = 'Value'
}) => {
  const { user } = useAuth()

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Rank
            </th>
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              User
            </th>
            {showValue && (
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {valueLabel}
              </th>
            )}
            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === user?.id
            const rankIcon = getRankIcon(entry.rank)
            
            return (
              <tr 
                key={entry.userId}
                className={isCurrentUser ? 'bg-primary-50' : ''}
              >
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <span className={`font-medium ${isCurrentUser ? 'text-primary-700' : 'text-gray-900'}`}>
                      #{entry.rank}
                    </span>
                    {rankIcon && <span className="ml-2">{rankIcon}</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      isCurrentUser ? 'bg-primary-600' : 'bg-gray-400'
                    }`}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`ml-3 ${isCurrentUser ? 'font-medium text-primary-700' : 'text-gray-900'}`}>
                      {entry.username}
                      {isCurrentUser && ' (You)'}
                    </span>
                  </div>
                </td>
                {showValue && (
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {entry.totalValue}
                  </td>
                )}
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isCurrentUser 
                      ? 'bg-primary-100 text-primary-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.totalPoints} pts
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
