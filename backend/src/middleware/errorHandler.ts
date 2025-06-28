import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError | Error, // You can be more specific with your custom error type
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message
    })
    return;
  }

  // Prisma errors (example check)
  if (err.message.includes('Unique constraint')) {
    res.status(400).json({
      error: 'This record already exists.'
    })
    return;
  }

  // Default to a 500 server error for any other unknown errors
  console.error('UNHANDLED ERROR:', err) // It's good practice to log the full error
  res.status(500).json({
    error: 'Something went wrong!'
  })
}
