import React from 'react'

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-accent-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-slate-500">Loading...</p>
    </div>
  )
}