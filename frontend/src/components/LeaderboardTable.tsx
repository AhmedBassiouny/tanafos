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

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-600' }
    if (rank === 2) return { icon: '🥈', color: 'text-slate-500' }
    if (rank === 3) return { icon: '🥉', color: 'text-orange-600' }
    return { icon: null, color: 'text-slate-600' }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              User
            </th>
            {showValue && (
              <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
                {valueLabel}
              </th>
            )}
            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === user?.id
            const { icon, color } = getRankDisplay(entry.rank)
            
            return (
              <tr 
                key={entry.userId}
                className={`${isCurrentUser ? 'bg-accent-50' : 'hover:bg-slate-50'} transition-colors`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCurrentUser ? 'text-accent-700' : color}`}>
                      #{entry.rank}
                    </span>
                    {icon && <span>{icon}</span>}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCurrentUser 
                        ? 'bg-accent-500 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-medium ${isCurrentUser ? 'text-accent-700' : 'text-slate-900'}`}>
                      {entry.username}
                      {isCurrentUser && ' (You)'}
                    </span>
                  </div>
                </td>
                {showValue && (
                  <td className="py-4 px-4 text-slate-600">
                    {entry.totalValue}
                  </td>
                )}
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isCurrentUser 
                      ? 'bg-accent-100 text-accent-700' 
                      : 'bg-slate-100 text-slate-700'
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