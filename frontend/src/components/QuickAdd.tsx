import React, { useState } from 'react'
import type { Task } from '../types'
import { progress as progressApi } from '../lib/api'

interface QuickAddProps {
  task: Task
  onSuccess: () => void
}

const QUICK_VALUES: { [key: string]: number[] } = {
  'minutes': [15, 30, 45, 60],
  'pages': [5, 10, 20, 30],
  'glasses': [1, 2, 3, 4],
  'hours': [1, 2, 7, 8]
}

export const QuickAdd: React.FC<QuickAddProps> = ({ task, onSuccess }) => {
  const [isLoading, setIsLoading] = useState<number | null>(null)
  
  const quickValues = QUICK_VALUES[task.unit] || [1, 5, 10, 20]
  
  const handleQuickAdd = async (value: number) => {
    setIsLoading(value)
    
    try {
      await progressApi.log({
        taskId: task.id,
        value
      })
      onSuccess()
    } catch (err) {
      // Silently fail for quick add
      console.error('Quick add failed:', err)
    } finally {
      setIsLoading(null)
    }
  }
  
  return (
    <div className="flex space-x-2 mt-3">
      <span className="text-xs text-gray-500">Quick add:</span>
      {quickValues.map((value) => (
        <button
          key={value}
          onClick={() => handleQuickAdd(value)}
          disabled={isLoading !== null}
          className={`
            text-xs px-2 py-1 rounded-full transition-colors
            ${isLoading === value 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading === value ? '...' : `+${value}`}
        </button>
      ))}
    </div>
  )
}
