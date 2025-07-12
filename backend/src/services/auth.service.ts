import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { prisma } from '../config/database'
import { SignupInput, LoginInput, JwtPayload } from '../types/auth'
import { AppError } from '../middleware/errorHandler'

export class AuthService {
  // Hash password before storing
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  // Verify password during login
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Generate JWT token
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d' // Token expires in 7 days
    })
  }

  // Verify JWT token
  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwtSecret) as JwtPayload
  }

  // Signup new user
  static async signup(data: SignupInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError('Email already registered', 400)
      }
      throw new AppError('Username already taken', 400)
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email
    })

    return { user, token }
  }

  // Login existing user
  static async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, user.passwordHash)
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401)
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email
    })

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    }
  }
}