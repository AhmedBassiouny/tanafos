import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div className={`
      bg-white rounded-2xl p-6 shadow-soft border border-slate-100 transition-all duration-200
      ${hover ? 'hover:shadow-soft-lg cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}