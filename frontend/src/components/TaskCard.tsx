import React from 'react'
import type { Task } from '../types'
import { Card } from './ui'

interface TaskCardProps {
  task: Task
  todayProgress?: number
  onLogProgress: (task: Task) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  todayProgress = 0, 
  onLogProgress 
}) => {
  return (
    <Card hover className="group">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{task.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {task.pointsPerUnit} {task.pointsPerUnit === 1 ? 'point' : 'points'} per {task.unit}
          </p>
          
          {todayProgress > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-700">
                {todayProgress} {task.unit} today
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => onLogProgress(task)}
          aria-label="Log progress"
          className="ml-4 w-12 h-12 bg-accent-50 text-accent-600 rounded-xl flex items-center justify-center hover:bg-accent-100 transition-colors group-hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </Card>
  )
}