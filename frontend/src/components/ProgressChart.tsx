import React from 'react'
import { Card } from './ui'

interface ProgressChartProps {
  data: {
    date: string
    value: number
  }[]
  title: string
  unit: string
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, title, unit }) => {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No data to display yet</p>
      </Card>
    )
  }

  // Simple bar chart
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 w-20">{item.date}</span>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-primary-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {item.value} {unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
