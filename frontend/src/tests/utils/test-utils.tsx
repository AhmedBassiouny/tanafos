import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthProvider'
import { ToastProvider } from '../../contexts/ToastContext'
import type { User } from '../../types'

// Mock user for testing
export const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
}

// Mock tasks for testing
export const mockTasks = [
  {
    id: 1,
    name: 'Exercise',
    unit: 'minutes',
    pointsPerUnit: 1,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Reading',
    unit: 'pages',
    pointsPerUnit: 2,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

// Mock user stats
export const mockUserStats = {
  userId: 1,
  username: 'testuser',
  totalPoints: 150,
  taskStats: [
    {
      taskId: 1,
      taskName: 'Exercise',
      totalValue: 90,
      totalPoints: 90,
    },
    {
      taskId: 2,
      taskName: 'Reading',
      totalValue: 30,
      totalPoints: 60,
    },
  ],
}

// Mock leaderboard
export const mockLeaderboard = [
  {
    rank: 1,
    userId: 2,
    username: 'user2',
    totalPoints: 200,
  },
  {
    rank: 2,
    userId: 1,
    username: 'testuser',
    totalPoints: 150,
  },
  {
    rank: 3,
    userId: 3,
    username: 'user3',
    totalPoints: 100,
  },
]

// Mock progress
export const mockTodayProgress = [
  {
    id: 1,
    taskId: 1,
    taskName: 'Exercise',
    taskUnit: 'minutes',
    value: 30,
    pointsEarned: 30,
    loggedDate: new Date().toISOString(),
  },
]

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: User | null
  initialRoute?: string
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  {
    initialRoute = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // Mock the useAuth hook
  const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <AuthProvider>
        {children}
      </AuthProvider>
    )
  }

  // Update window location if needed
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute)
  }

  const Wrapper = ({ children }: { children?: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <MockAuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MockAuthProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// re-export everything
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'

// Named export for custom render
export { customRender as render }