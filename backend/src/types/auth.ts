export interface SignupInput {
  username: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface JwtPayload {
  userId: number
  email: string
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}