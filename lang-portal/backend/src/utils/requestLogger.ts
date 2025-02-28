import { Request, Response, NextFunction } from 'express'
import { logger } from './logger'

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  })
  
  // Log request body in debug mode
  if (req.body && Object.keys(req.body).length > 0) {
    logger.debug('Request body:', req.body)
  }
  
  // Log query parameters in debug mode
  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug('Query parameters:', req.query)
  }
  
  // Capture response data
  const originalSend = res.send
  res.send = function(body): Response {
    const responseTime = Date.now() - start
    
    // Log response details
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime
    })
    
    // Call the original send function
    return originalSend.call(this, body)
  }
  
  next()
} 