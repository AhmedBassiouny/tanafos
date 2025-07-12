import { Router, Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { Validator } from '../utils/validation'

const router = Router()

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = Validator.validateSignup(req.body)
    
    // Create user
    const result = await AuthService.signup(validatedData)
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.user,
      token: result.token
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = Validator.validateLogin(req.body)
    
    // Login user
    const result = await AuthService.login(validatedData)
    
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' })
})

export default router