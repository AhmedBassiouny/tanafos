import React from 'react'

interface ErrorProps {
  message: string
  onRetry?: () => void
}

export const Error: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="text-center py-12">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  )
}