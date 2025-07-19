import React from 'react'
import type { Task } from '../types'
import { Button, Card } from './ui'

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
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {task.pointsPerUnit} {task.pointsPerUnit === 1 ? 'point' : 'points'} per {task.unit}
          </p>
          
          {todayProgress > 0 && (
            <div className="mt-3 bg-green-50 text-green-700 px-3 py-1 rounded-full inline-block">
              <span className="text-sm font-medium">
                Today: {todayProgress} {task.unit}
              </span>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => onLogProgress(task)}
          size="sm"
          className="ml-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log
        </Button>
      </div>
    </Card>
  )
}
