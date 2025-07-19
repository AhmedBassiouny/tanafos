import React, { useState, useEffect } from 'react'
import type { User } from '../types'
import { user as userApi } from '../lib/api'
import { AuthContext } from './AuthContext'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await userApi.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only check auth if there's a token, otherwise just set loading to false
    const token = localStorage.getItem('token')
    if (token) {
      checkAuth()
    } else {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}