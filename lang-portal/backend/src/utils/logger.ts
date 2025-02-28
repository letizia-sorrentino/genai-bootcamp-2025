import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Get log level from environment variables
const getLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || 'info'
  
  switch (level) {
    case 'error':
      return LogLevel.ERROR
    case 'warn':
      return LogLevel.WARN
    case 'info':
      return LogLevel.INFO
    case 'debug':
      return LogLevel.DEBUG
    default:
      return LogLevel.INFO
  }
}

const currentLogLevel = getLogLevel()

export const logger = {
  error: (message: string, ...args: any[]): void => {
    if (currentLogLevel >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (currentLogLevel >= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    if (currentLogLevel >= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },
  
  debug: (message: string, ...args: any[]): void => {
    if (currentLogLevel >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }
} 