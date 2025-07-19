import { createContext } from 'react'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)