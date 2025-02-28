import { Request, Response, NextFunction } from 'express'
import { ValidationError } from './errorHandler'

// Interface for validation rules
interface ValidationRules {
  [key: string]: {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
    min?: number
    max?: number
    pattern?: RegExp
    enum?: any[]
    custom?: (value: any) => boolean | string
  }
}

// Validate request body against rules
export const validateBody = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {}
    
    // Check each field against rules
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = req.body[field]
      
      // Check if required
      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`
        continue
      }
      
      // Skip further validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue
      }
      
      // Check type
      if (fieldRules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value
        if (actualType !== fieldRules.type) {
          errors[field] = `${field} must be a ${fieldRules.type}`
          continue
        }
      }
      
      // Check min/max for strings and arrays
      if (fieldRules.min !== undefined && (typeof value === 'string' || Array.isArray(value))) {
        if (value.length < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min} characters long`
        }
      }
      
      if (fieldRules.max !== undefined && (typeof value === 'string' || Array.isArray(value))) {
        if (value.length > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max} characters long`
        }
      }
      
      // Check min/max for numbers
      if (fieldRules.min !== undefined && typeof value === 'number') {
        if (value < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min}`
        }
      }
      
      if (fieldRules.max !== undefined && typeof value === 'number') {
        if (value > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max}`
        }
      }
      
      // Check pattern
      if (fieldRules.pattern && typeof value === 'string') {
        if (!fieldRules.pattern.test(value)) {
          errors[field] = `${field} has an invalid format`
        }
      }
      
      // Check enum
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${fieldRules.enum.join(', ')}`
      }
      
      // Custom validation
      if (fieldRules.custom) {
        const result = fieldRules.custom(value)
        if (result !== true) {
          errors[field] = typeof result === 'string' ? result : `${field} is invalid`
        }
      }
    }
    
    // If there are validation errors, throw a ValidationError
    if (Object.keys(errors).length > 0) {
      next(new ValidationError('Validation failed', errors))
      return
    }
    
    // If validation passes, continue to the next middleware
    next()
  }
}

// Validate query parameters against rules
export const validateQuery = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {}
    
    // Check each field against rules
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = req.query[field] as any
      
      // Check if required
      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`
        continue
      }
      
      // Skip further validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue
      }
      
      // For query parameters, we need to convert types
      let typedValue: any = value
      
      if (fieldRules.type === 'number') {
        typedValue = Number(value)
        if (isNaN(typedValue)) {
          errors[field] = `${field} must be a number`
          continue
        }
      } else if (fieldRules.type === 'boolean') {
        typedValue = value === 'true'
      }
      
      // Check min/max for strings
      if (fieldRules.min !== undefined && typeof value === 'string') {
        if (value.length < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min} characters long`
        }
      }
      
      if (fieldRules.max !== undefined && typeof value === 'string') {
        if (value.length > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max} characters long`
        }
      }
      
      // Check min/max for numbers
      if (fieldRules.min !== undefined && fieldRules.type === 'number') {
        if (typedValue < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min}`
        }
      }
      
      if (fieldRules.max !== undefined && fieldRules.type === 'number') {
        if (typedValue > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max}`
        }
      }
      
      // Check pattern
      if (fieldRules.pattern && typeof value === 'string') {
        if (!fieldRules.pattern.test(value)) {
          errors[field] = `${field} has an invalid format`
        }
      }
      
      // Check enum
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${fieldRules.enum.join(', ')}`
      }
      
      // Custom validation
      if (fieldRules.custom) {
        const result = fieldRules.custom(value)
        if (result !== true) {
          errors[field] = typeof result === 'string' ? result : `${field} is invalid`
        }
      }
    }
    
    // If there are validation errors, throw a ValidationError
    if (Object.keys(errors).length > 0) {
      next(new ValidationError('Validation failed', errors))
      return
    }
    
    // If validation passes, continue to the next middleware
    next()
  }
}

// Validate URL parameters against rules
export const validateParams = (rules: ValidationRules) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {}
    
    // Check each field against rules
    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = req.params[field]
      
      // Check if required
      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`
        continue
      }
      
      // Skip further validation if value is not provided and not required
      if (value === undefined || value === null) {
        continue
      }
      
      // For URL parameters, we need to convert types
      let typedValue: any = value
      
      if (fieldRules.type === 'number') {
        typedValue = Number(value)
        if (isNaN(typedValue)) {
          errors[field] = `${field} must be a number`
          continue
        }
      }
      
      // Check min/max for strings
      if (fieldRules.min !== undefined && typeof value === 'string') {
        if (value.length < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min} characters long`
        }
      }
      
      if (fieldRules.max !== undefined && typeof value === 'string') {
        if (value.length > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max} characters long`
        }
      }
      
      // Check min/max for numbers
      if (fieldRules.min !== undefined && fieldRules.type === 'number') {
        if (typedValue < fieldRules.min) {
          errors[field] = `${field} must be at least ${fieldRules.min}`
        }
      }
      
      if (fieldRules.max !== undefined && fieldRules.type === 'number') {
        if (typedValue > fieldRules.max) {
          errors[field] = `${field} must be at most ${fieldRules.max}`
        }
      }
      
      // Check pattern
      if (fieldRules.pattern && typeof value === 'string') {
        if (!fieldRules.pattern.test(value)) {
          errors[field] = `${field} has an invalid format`
        }
      }
      
      // Check enum
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${fieldRules.enum.join(', ')}`
      }
      
      // Custom validation
      if (fieldRules.custom) {
        const result = fieldRules.custom(value)
        if (result !== true) {
          errors[field] = typeof result === 'string' ? result : `${field} is invalid`
        }
      }
    }
    
    // If there are validation errors, throw a ValidationError
    if (Object.keys(errors).length > 0) {
      next(new ValidationError('Validation failed', errors))
      return
    }
    
    // If validation passes, continue to the next middleware
    next()
  }
} 