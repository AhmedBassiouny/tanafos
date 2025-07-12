import { SignupInput, LoginInput } from '../types/auth'
import { LogProgressInput } from '../types/progress'
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

  static validateProgress(data: any): LogProgressInput {
    const { taskId, value, date } = data

    if (!taskId || typeof taskId !== 'number') {
      throw new AppError('Valid task ID is required', 400)
    }

    if (value === undefined || value === null || typeof value !== 'number') {
      throw new AppError('Value is required and must be a number', 400)
    }

    if (value <= 0) {
      throw new AppError('Value must be greater than 0', 400)
    }

    if (value > 1000) {
      throw new AppError('Value cannot exceed 1000', 400)
    }

    // If date provided, validate it
    let logDate = new Date()
    if (date) {
      logDate = new Date(date)
      if (isNaN(logDate.getTime())) {
        throw new AppError('Invalid date format', 400)
      }
      
      // Don't allow future dates
      if (logDate > new Date()) {
        throw new AppError('Cannot log progress for future dates', 400)
      }
    }

    return {
      taskId,
      value,
      date: logDate
    }
  }
}