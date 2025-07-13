import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export const Landing: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Welcome to Tanafos
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Foster motivation and friendly competition among your friends. 
        Track progress, earn points, and climb the leaderboard together!
      </p>
      
      <div className="space-x-4">
        {isAuthenticated ? (
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">Login</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}