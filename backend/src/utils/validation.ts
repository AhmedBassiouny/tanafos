import { SignupInput, LoginInput } from '../types/auth'
import { AppError } from '../middleware/errorHandler'

export class Validator {
  static validateSignup(data: any): SignupInput {
    const { username, email, password } = data

    // Check required fields
    if (!username || !email || !password) {
      throw new AppError('Username, email, and password are required', 400)
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      throw new AppError('Username must be between 3 and 20 characters', 400)
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new AppError('Username can only contain letters, numbers, and underscores', 400)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400)
    }

    // Password validation
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400)
    }

    return { username, email, password }
  }

  static validateLogin(data: any): LoginInput {
    const { email, password } = data

    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    return { email, password }
  }
}