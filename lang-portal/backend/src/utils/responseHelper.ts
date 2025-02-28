import { Response } from 'express'

// Standard success response
export const successResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

// Paginated response
export const paginatedResponse = (
  res: Response,
  items: any[],
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  },
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    items,
    pagination
  })
}

// Error response
export const errorResponse = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  errors: Record<string, string> | null = null
): Response => {
  const response: {
    success: boolean
    message: string
    errors?: Record<string, string>
  } = {
    success: false,
    message
  }

  if (errors) {
    response.errors = errors
  }

  return res.status(statusCode).json(response)
}

// Not found response
export const notFoundResponse = (
  res: Response,
  message: string = 'Resource not found'
): Response => {
  return errorResponse(res, message, 404)
}

// Bad request response
export const badRequestResponse = (
  res: Response,
  message: string = 'Bad request',
  errors: Record<string, string> | null = null
): Response => {
  return errorResponse(res, message, 400, errors)
}

// Unauthorized response
export const unauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized'
): Response => {
  return errorResponse(res, message, 401)
}

// Forbidden response
export const forbiddenResponse = (
  res: Response,
  message: string = 'Forbidden'
): Response => {
  return errorResponse(res, message, 403)
}

// Validation error response
export const validationErrorResponse = (
  res: Response,
  errors: Record<string, string>,
  message: string = 'Validation failed'
): Response => {
  return errorResponse(res, message, 422, errors)
}

// Conflict response
export const conflictResponse = (
  res: Response,
  message: string = 'Resource conflict'
): Response => {
  return errorResponse(res, message, 409)
} 