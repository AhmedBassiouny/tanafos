import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle,
  icon
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
          {icon}
        </div>
      )}
    </div>
  )
}