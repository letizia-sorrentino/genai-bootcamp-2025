import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { logger } from './logger'

// Base API Error class
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// 400 Bad Request Error
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message)
    this.name = 'BadRequestError'
  }
}

// 401 Unauthorized Error
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

// 403 Forbidden Error
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message)
    this.name = 'ForbiddenError'
  }
}

// 404 Not Found Error
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

// 409 Conflict Error
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message)
    this.name = 'ConflictError'
  }
}

// 422 Validation Error
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', public errors?: Record<string, string>) {
    super(422, message)
    this.name = 'ValidationError'
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message)
    this.name = 'InternalServerError'
  }
}

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error(`Error: ${err.message}`, {
    path: req.path,
    method: req.method,
    error: err
  })

  // Handle API errors
  if (err instanceof ApiError) {
    // For validation errors, include the validation errors in the response
    if (err instanceof ValidationError && err.errors) {
      res.status(err.statusCode).json({
        error: err.message,
        errors: err.errors
      })
      return
    }

    // For other API errors, just return the status code and message
    res.status(err.statusCode).json({
      error: err.message
    })
    return
  }

  // Handle SQLite errors
  if (err.message && err.message.includes('SQLITE_CONSTRAINT')) {
    res.status(409).json({
      error: 'Database constraint violation'
    })
    return
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON'
    })
    return
  }

  // Handle other errors as 500 Internal Server Error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Internal server error'
  })
} 