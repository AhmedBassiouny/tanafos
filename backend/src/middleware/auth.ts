import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { NameAnonymizerService } from '../services/name-anonymizer.service'
import { AppError } from './errorHandler'

interface AuthRequest extends Request {
  user?: {
    userId: number
    email: string
  }
  sessionId?: string
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token is required', 401))
    }

    // Extract token
    const token = authHeader.split(' ')[1]
    
    // Verify token
    const payload = AuthService.verifyToken(token)
    
    // Add user info to request
    req.user = payload
    
    // Handle session ID for name anonymization
    let sessionId = req.headers['x-session-id'] as string
    if (!sessionId) {
      sessionId = NameAnonymizerService.generateSessionId()
      res.setHeader('x-session-id', sessionId)
    }
    req.sessionId = sessionId
    
    next()
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
        next(new AppError('Invalid token', 401))
        return
    }
    if (error instanceof Error && error.name === 'TokenExpiredError') {
        next(new AppError('Token expired', 401))
        return 
    }
    next(error)
  }
}